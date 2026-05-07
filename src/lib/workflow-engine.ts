import {
  type WorkflowNode,
  type WorkflowConnection,
  type PortDataValue,
} from '@/store/workflow-types'
import { useWorkflowStore, type WorkflowState } from '@/store/workflow-store'

// ---------------------------------------------------------------------------
// Topological sort – returns node IDs in execution order grouped by level.
// Nodes at the same level can be executed in parallel.
// Cycles are detected; nodes that belong to a cycle are omitted and an error
// is recorded for each of them.
// ---------------------------------------------------------------------------
export function getExecutionOrder(
  nodes: WorkflowNode[],
  connections: WorkflowConnection[]
): string[][] {
  const nodeIds = new Set(nodes.map((n) => n.id))
  const adj = new Map<string, Set<string>>() // source -> set of targets
  const inDegree = new Map<string, number>()

  for (const id of nodeIds) {
    adj.set(id, new Set())
    inDegree.set(id, 0)
  }

  for (const conn of connections) {
    if (!nodeIds.has(conn.sourceNodeId) || !nodeIds.has(conn.targetNodeId)) continue
    adj.get(conn.sourceNodeId)!.add(conn.targetNodeId)
    inDegree.set(conn.targetNodeId, (inDegree.get(conn.targetNodeId) ?? 0) + 1)
  }

  // BFS level-by-level for parallel execution
  const queue: string[] = []
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id)
  }

  const levels: string[][] = []
  const orderedSet = new Set<string>()

  while (queue.length > 0) {
    const level = [...queue]
    levels.push(level)
    for (const id of level) orderedSet.add(id)

    const nextQueue: string[] = []
    for (const id of level) {
      for (const target of adj.get(id) ?? []) {
        const newDeg = (inDegree.get(target) ?? 1) - 1
        inDegree.set(target, newDeg)
        if (newDeg === 0) nextQueue.push(target)
      }
    }
    queue.length = 0
    queue.push(...nextQueue)
  }

  // Nodes not in order are part of a cycle
  const cyclicNodes = nodes.filter((n) => !orderedSet.has(n.id))
  const store = useWorkflowStore.getState()
  for (const node of cyclicNodes) {
    store.setNodeStatus(node.id, 'error', 'Cycle detected – node skipped')
  }

  return levels
}

// ---------------------------------------------------------------------------
// Gather all input PortDataValues for a given node by looking at connections
// whose target is this node and pulling the source node's output.
// ---------------------------------------------------------------------------
export function getNodeInputs(
  nodeId: string,
  _store: WorkflowState
): Record<string, PortDataValue> {
  const store = useWorkflowStore.getState()
  const inputs: Record<string, PortDataValue> = {}

  for (const conn of store.connections) {
    if (conn.targetNodeId !== nodeId) continue
    const sourceNode = store.nodes.find((n) => n.id === conn.sourceNodeId)
    if (!sourceNode) continue

    const outputValue = sourceNode.outputs[conn.sourcePortId]
    if (outputValue !== undefined) {
      inputs[conn.targetPortId] = outputValue
    }
  }

  return inputs
}

// ---------------------------------------------------------------------------
// Client-side image transform using Canvas API
// ---------------------------------------------------------------------------
async function transformImageClient(
  imageSource: string,
  options: {
    mode: string
    width: number
    height: number
    filter: string
    brightness: number
    contrast: number
    saturation: number
  }
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      const canvas = document.createElement('canvas')

      if (options.mode === 'resize') {
        canvas.width = options.width
        canvas.height = options.height
      } else {
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      // Apply CSS filters
      const filters: string[] = []

      if (options.mode === 'filter') {
        switch (options.filter) {
          case 'grayscale':
            filters.push('grayscale(100%)')
            break
          case 'sepia':
            filters.push('sepia(100%)')
            break
          case 'invert':
            filters.push('invert(100%)')
            break
          case 'blur':
            filters.push('blur(3px)')
            break
          case 'sharpen':
            // Sharpen is approximated by unsharp mask via contrast boost
            filters.push('contrast(110%)')
            break
        }
      }

      if (options.mode === 'adjust') {
        filters.push(`brightness(${options.brightness}%)`)
        filters.push(`contrast(${options.contrast}%)`)
        filters.push(`saturate(${options.saturation}%)`)
      }

      if (filters.length > 0) {
        ctx.filter = filters.join(' ')
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      try {
        const dataUrl = canvas.toDataURL('image/png')
        resolve(dataUrl)
      } catch {
        reject(new Error('Failed to export transformed image (CORS)'))
      }
    }

    img.onerror = () => {
      reject(new Error('Failed to load image for transformation'))
    }

    img.src = imageSource
  })
}

// ---------------------------------------------------------------------------
// Execute a single node
// ---------------------------------------------------------------------------
export async function executeNode(
  nodeId: string,
  _workflowStore: WorkflowState
): Promise<void> {
  const store = useWorkflowStore.getState()
  const node = store.nodes.find((n) => n.id === nodeId)
  if (!node) return

  // Skip note nodes – they don't execute
  if (node.type === 'note') {
    store.setNodeStatus(nodeId, 'completed')
    return
  }

  // Gather inputs from already-completed upstream nodes
  const inputs = getNodeInputs(nodeId, store)

  store.setNodeStatus(nodeId, 'running')
  store.addExecutingNode(nodeId)

  try {
    let outputs: Record<string, PortDataValue> = {}

    switch (node.type) {
      // ── Input Nodes ───────────────────────────────────────
      case 'text-input': {
        const text = (node.data.text as string) || ''
        if (!text.trim()) {
          throw new Error('Text input is empty')
        }
        outputs = {
          output_0_text: { dataType: 'text', value: text },
        }
        break
      }

      case 'image-input': {
        const imageBase64 = (node.data.imageBase64 as string) || ''
        if (!imageBase64) {
          throw new Error('No image uploaded')
        }
        outputs = {
          output_0_image: { dataType: 'image', value: imageBase64 },
        }
        break
      }

      case 'color-picker': {
        const color = (node.data.color as string) || '#8b5cf6'
        outputs = {
          output_0_color: { dataType: 'color', value: color },
        }
        break
      }

      case 'number-input': {
        const value = (node.data.value as number) ?? 0
        outputs = {
          output_0_number: { dataType: 'number', value },
        }
        break
      }

      // ── AI Nodes ──────────────────────────────────────────
      case 'text-ai': {
        const contextValue = inputs['input_0_text']
        const contextText =
          contextValue?.dataType === 'text' ? String(contextValue.value) : ''
        const prompt = (node.data.prompt as string) || ''
        const systemPrompt =
          (node.data.systemPrompt as string) ||
          'You are a creative design assistant.'
        const temperature = (node.data.temperature as number) ?? 0.7
        const maxTokens = (node.data.maxTokens as number) ?? 500

        const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
          { role: 'system', content: systemPrompt },
        ]
        if (contextText) {
          messages.push({ role: 'user', content: contextText })
        }
        messages.push({ role: 'user', content: prompt })

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages, temperature, maxTokens }),
        })

        if (!res.ok) {
          const err = await res.text()
          throw new Error(err || `Chat API error ${res.status}`)
        }

        const data = await res.json()
        const text = data.content ?? data.text ?? data.message ?? JSON.stringify(data)
        outputs = {
          output_1_text: { dataType: 'text', value: text },
        }
        break
      }

      case 'image-gen': {
        const promptInput = inputs['input_0_text']
        const promptText = promptInput?.dataType === 'text'
          ? String(promptInput.value)
          : (node.data.prompt as string) || ''
        const negativePrompt = (node.data.negativePrompt as string) || ''
        const size = (node.data.size as string) || '1024x1024'
        const style = (node.data.style as string) || 'vivid'

        const res = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: promptText,
            negativePrompt,
            size,
            style,
          }),
        })

        if (!res.ok) {
          const err = await res.text()
          throw new Error(err || `Image Gen API error ${res.status}`)
        }

        const data = await res.json()
        const imageUrl = data.url ?? data.imageUrl ?? data.image ?? ''
        outputs = {
          output_1_image: { dataType: 'image', value: imageUrl },
        }
        break
      }

      case 'image-edit': {
        const imageInput = inputs['input_0_image']
        const imageValue =
          imageInput?.dataType === 'image' ? String(imageInput.value) : ''
        const mode = (node.data.mode as string) || 'analyze'

        const res = await fetch('/api/analyze-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageValue, mode }),
        })

        if (!res.ok) {
          const err = await res.text()
          throw new Error(err || `Image Edit API error ${res.status}`)
        }

        const data = await res.json()
        outputs = {
          output_1_imageLayers: {
            dataType: 'imageLayers',
            value: data.layers ?? data,
          },
        }
        break
      }

      case '3d-gen': {
        const imageInput = inputs['input_0_image']
        const imageValue =
          imageInput?.dataType === 'image' ? String(imageInput.value) : ''

        if (!imageValue) {
          throw new Error('No image input provided for 3D generation')
        }

        const res = await fetch('/api/image-to-3d', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: imageValue }),
        })

        if (!res.ok) {
          const err = await res.text()
          throw new Error(err || `3D Gen API error ${res.status}`)
        }

        const data = await res.json()
        const modelValue = data.modelData
          ? `data:model/gltf-binary;base64,${data.modelData}`
          : data.modelUrl ?? data
        outputs = {
          output_1_model3d: {
            dataType: 'model3d',
            value: modelValue,
            meta: { fallback: data.fallback ?? false },
          },
        }
        break
      }

      case 'brand-kit': {
        const promptInput = inputs['input_0_text']
        const promptText = promptInput?.dataType === 'text'
          ? String(promptInput.value)
          : (node.data.prompt as string) || ''
        const industry = (node.data.industry as string) || ''

        const res = await fetch('/api/brand-kit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: promptText, industry }),
        })

        if (!res.ok) {
          const err = await res.text()
          throw new Error(err || `Brand Kit API error ${res.status}`)
        }

        const data = await res.json()
        outputs = {
          output_1_brandKit: { dataType: 'brandKit', value: data },
        }
        break
      }

      case 'remove-bg': {
        const imageInput = inputs['input_0_image']
        const imageValue =
          imageInput?.dataType === 'image' ? String(imageInput.value) : ''

        if (!imageValue) {
          throw new Error('No image input provided for background removal')
        }

        const res = await fetch('/api/remove-bg', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: imageValue }),
        })

        if (!res.ok) {
          const err = await res.text()
          throw new Error(err || `Remove BG API error ${res.status}`)
        }

        const data = await res.json()
        // imageUrl has data: prefix, imageBase64 does not — prefer imageUrl
        let resultImage = data.imageUrl ?? ''
        if (!resultImage && data.imageBase64) {
          resultImage = data.imageBase64.startsWith('data:')
            ? data.imageBase64
            : `data:image/png;base64,${data.imageBase64}`
        }
        outputs = {
          output_1_image: { dataType: 'image', value: resultImage },
        }
        break
      }

      case 'style-transfer': {
        const imageInput = inputs['input_0_image']
        const imageValue =
          imageInput?.dataType === 'image' ? String(imageInput.value) : ''
        const styleInput = inputs['input_1_text']
        const stylePrompt = styleInput?.dataType === 'text'
          ? String(styleInput.value)
          : (node.data.stylePrompt as string) || ''

        if (!imageValue) {
          throw new Error('No image input provided for style transfer')
        }
        if (!stylePrompt) {
          throw new Error('No style prompt provided for style transfer')
        }

        const res = await fetch('/api/style-transfer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: imageValue, stylePrompt }),
        })

        if (!res.ok) {
          const err = await res.text()
          throw new Error(err || `Style Transfer API error ${res.status}`)
        }

        const data = await res.json()
        // imageUrl/image may have data: prefix or be a URL — normalize
        let resultImage = data.imageUrl ?? data.image ?? ''
        if (!resultImage && data.imageBase64) {
          resultImage = data.imageBase64.startsWith('data:')
            ? data.imageBase64
            : `data:image/png;base64,${data.imageBase64}`
        }
        outputs = {
          output_2_image: { dataType: 'image', value: resultImage },
        }
        break
      }

      case 'svg-vectorize': {
        const imageInput = inputs['input_0_image']
        const imageValue =
          imageInput?.dataType === 'image' ? String(imageInput.value) : ''

        if (!imageValue) {
          throw new Error('No image input provided for vectorization')
        }

        const res = await fetch('/api/vectorize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: imageValue }),
        })

        if (!res.ok) {
          const err = await res.text()
          throw new Error(err || `Vectorize API error ${res.status}`)
        }

        const data = await res.json()
        const svgText = data.svg ?? ''
        outputs = {
          output_1_text: { dataType: 'text', value: svgText },
        }
        break
      }

      // ── Transform Nodes ───────────────────────────────────
      case 'image-transform': {
        const imageInput = inputs['input_0_image']
        const imageValue =
          imageInput?.dataType === 'image' ? String(imageInput.value) : ''

        if (!imageValue) {
          throw new Error('No image input provided for transformation')
        }

        const mode = (node.data.mode as string) || 'resize'
        const width = (node.data.width as number) || 512
        const height = (node.data.height as number) || 512
        const filter = (node.data.filter as string) || 'none'
        const brightness = (node.data.brightness as number) ?? 100
        const contrast = (node.data.contrast as number) ?? 100
        const saturation = (node.data.saturation as number) ?? 100

        const transformedImage = await transformImageClient(imageValue, {
          mode,
          width,
          height,
          filter,
          brightness,
          contrast,
          saturation,
        })

        outputs = {
          output_1_image: { dataType: 'image', value: transformedImage },
        }
        break
      }

      case 'text-template': {
        const template = (node.data.template as string) || ''

        // Get variable values from connected inputs
        const var1Input = inputs['input_0_text']
        const var2Input = inputs['input_1_text']
        const var3Input = inputs['input_2_text']

        const var1 = var1Input?.value ? String(var1Input.value) : ''
        const var2 = var2Input?.value ? String(var2Input.value) : ''
        const var3 = var3Input?.value ? String(var3Input.value) : ''

        // Replace {{1}}, {{2}}, {{3}} with variable values
        let result = template
        result = result.replace(/\{\{1\}\}/g, var1)
        result = result.replace(/\{\{2\}\}/g, var2)
        result = result.replace(/\{\{3\}\}/g, var3)

        outputs = {
          output_3_text: { dataType: 'text', value: result },
        }
        break
      }

      // ── Logic Nodes ───────────────────────────────────────
      case 'condition': {
        const valueInput = inputs['input_0_any']
        const compareInput = inputs['input_1_any']
        const operator = (node.data.operator as string) || 'equals'

        const value = valueInput?.value
        const compare = compareInput?.value

        let conditionMet = false

        const valStr = value !== undefined ? String(value) : ''
        const cmpStr = compare !== undefined ? String(compare) : ''

        switch (operator) {
          case 'equals':
            conditionMet = valStr === cmpStr
            break
          case 'not_equals':
            conditionMet = valStr !== cmpStr
            break
          case 'contains':
            conditionMet = valStr.includes(cmpStr)
            break
          case 'greater_than':
            conditionMet = parseFloat(valStr) > parseFloat(cmpStr)
            break
          case 'less_than':
            conditionMet = parseFloat(valStr) < parseFloat(cmpStr)
            break
          case 'is_empty':
            conditionMet = valStr.trim() === ''
            break
          case 'is_not_empty':
            conditionMet = valStr.trim() !== ''
            break
        }

        // Route the input value to the appropriate output port
        if (conditionMet) {
          outputs = {
            output_2_any: valueInput ?? { dataType: 'any', value: true },
          }
        } else {
          outputs = {
            output_3_any: valueInput ?? { dataType: 'any', value: false },
          }
        }
        break
      }

      case 'merge': {
        const mode = (node.data.mode as string) || 'concat'
        const input1 = inputs['input_0_any']
        const input2 = inputs['input_1_any']
        const input3 = inputs['input_2_any']

        const allInputs = [input1, input2, input3].filter(Boolean)
        const nonEmpty = allInputs.filter((i) => i.value !== undefined && i.value !== '')

        let mergedValue: unknown

        switch (mode) {
          case 'concat':
            mergedValue = nonEmpty
              .map((i) => String(i.value))
              .join('\n')
            break
          case 'array':
            mergedValue = nonEmpty.map((i) => i.value)
            break
          case 'first':
            mergedValue = nonEmpty.length > 0 ? nonEmpty[0].value : null
            break
          case 'last':
            mergedValue = nonEmpty.length > 0 ? nonEmpty[nonEmpty.length - 1].value : null
            break
          default:
            mergedValue = nonEmpty.map((i) => String(i.value)).join('\n')
        }

        // Detect output type
        const outputDataType = nonEmpty.length > 0 ? nonEmpty[0].dataType : 'any'

        outputs = {
          output_3_any: { dataType: outputDataType, value: mergedValue },
        }
        break
      }

      // ── Output Nodes ──────────────────────────────────────
      case 'output': {
        // Just pass through any input data
        const anyInput = Object.values(inputs)[0]
        if (anyInput) {
          outputs = { input_0_any: anyInput }
        }
        break
      }

      case 'export': {
        // Pass through the input data for the UI to handle download
        const dataInput = inputs['input_0_any']
        if (dataInput) {
          outputs = { input_0_any: dataInput }
        }
        break
      }

      default:
        throw new Error(`Unknown node type: ${node.type}`)
    }

    // Write outputs
    const currentStore = useWorkflowStore.getState()
    for (const [portId, value] of Object.entries(outputs)) {
      currentStore.setNodeOutput(nodeId, portId, value)
    }
    currentStore.setNodeStatus(nodeId, 'completed')
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Execution failed'
    const currentStore = useWorkflowStore.getState()
    currentStore.setNodeStatus(nodeId, 'error', message)
  } finally {
    const currentStore = useWorkflowStore.getState()
    currentStore.removeExecutingNode(nodeId)
  }
}

// ---------------------------------------------------------------------------
// Execute the full workflow with parallel execution at each level
// ---------------------------------------------------------------------------
export async function executeWorkflow(
  _workflowStore: WorkflowState
): Promise<void> {
  const store = useWorkflowStore.getState()
  store.setIsExecuting(true)

  try {
    // Reset all nodes to idle before execution
    const currentStore = useWorkflowStore.getState()
    for (const node of currentStore.nodes) {
      currentStore.setNodeStatus(node.id, 'idle')
    }

    const levels = getExecutionOrder(currentStore.nodes, currentStore.connections)

    // Execute level by level, with parallel execution within each level
    for (const level of levels) {
      const currentStore2 = useWorkflowStore.getState()

      // Filter out nodes already in error from cycle detection
      const executableNodes = level.filter((nodeId) => {
        const node = currentStore2.nodes.find((n) => n.id === nodeId)
        return node && node.status !== 'error'
      })

      // Execute all nodes in this level in parallel
      await Promise.all(
        executableNodes.map((nodeId) => executeNode(nodeId, currentStore2))
      )
    }
  } finally {
    const currentStore = useWorkflowStore.getState()
    currentStore.setIsExecuting(false)
    // Safety: clear any remaining executing nodes
    for (const nodeId of currentStore.executingNodeIds) {
      currentStore.removeExecutingNode(nodeId)
    }
  }
}

// ---------------------------------------------------------------------------
// Convenience: run only a single node (gather inputs from completed upstream)
// ---------------------------------------------------------------------------
export async function executeSingleNode(nodeId: string): Promise<void> {
  const store = useWorkflowStore.getState()
  store.setIsExecuting(true)
  try {
    await executeNode(nodeId, store)
  } finally {
    const currentStore = useWorkflowStore.getState()
    currentStore.setIsExecuting(false)
    currentStore.removeExecutingNode(nodeId)
  }
}
