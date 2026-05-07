import {
  type WorkflowNode,
  type WorkflowConnection,
  type PortDataValue,
} from '@/store/workflow-types'
import { useWorkflowStore, type WorkflowState } from '@/store/workflow-store'

// ---------------------------------------------------------------------------
// Topological sort – returns node IDs in execution order.
// Cycles are detected; nodes that belong to a cycle are omitted and an error
// is recorded for each of them.
// ---------------------------------------------------------------------------
export function getExecutionOrder(
  nodes: WorkflowNode[],
  connections: WorkflowConnection[]
): string[] {
  const nodeIds = new Set(nodes.map((n) => n.id))
  const adj = new Map<string, Set<string>>() // target -> set of sources
  const inDegree = new Map<string, number>()

  for (const id of nodeIds) {
    adj.set(id, new Set())
    inDegree.set(id, 0)
  }

  for (const conn of connections) {
    if (!nodeIds.has(conn.sourceNodeId) || !nodeIds.has(conn.targetNodeId)) continue
    adj.get(conn.targetNodeId)!.add(conn.sourceNodeId)
    inDegree.set(conn.targetNodeId, (inDegree.get(conn.targetNodeId) ?? 0) + 1)
  }

  const queue: string[] = []
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id)
  }

  const order: string[] = []
  while (queue.length > 0) {
    const id = queue.shift()!
    order.push(id)
    for (const [target, sources] of adj) {
      if (sources.has(id)) {
        sources.delete(id)
        const newDeg = (inDegree.get(target) ?? 1) - 1
        inDegree.set(target, newDeg)
        if (newDeg === 0) queue.push(target)
      }
    }
  }

  // Nodes not in order are part of a cycle
  const orderedSet = new Set(order)
  const cyclicNodes = nodes.filter((n) => !orderedSet.has(n.id))

  // Mark cyclic nodes with error
  const store = useWorkflowStore.getState()
  for (const node of cyclicNodes) {
    store.setNodeStatus(node.id, 'error', 'Cycle detected – node skipped')
  }

  return order
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
// Execute a single node
// ---------------------------------------------------------------------------
export async function executeNode(
  nodeId: string,
  _workflowStore: WorkflowState
): Promise<void> {
  const store = useWorkflowStore.getState()
  const node = store.nodes.find((n) => n.id === nodeId)
  if (!node) return

  // Gather inputs from already-completed upstream nodes
  const inputs = getNodeInputs(nodeId, store)

  store.setNodeStatus(nodeId, 'running')
  store.setExecutingNodeId(nodeId)

  try {
    let outputs: Record<string, PortDataValue> = {}

    switch (node.type) {
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
        // API returns { success, modelData (base64 GLB), fallback }
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

      case 'output': {
        // Just pass through any input data
        const anyInput = Object.values(inputs)[0]
        if (anyInput) {
          outputs = { input_0_any: anyInput }
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
    if (currentStore.executingNodeId === nodeId) {
      currentStore.setExecutingNodeId(null)
    }
  }
}

// ---------------------------------------------------------------------------
// Execute the full workflow
// ---------------------------------------------------------------------------
export async function executeWorkflow(
  _workflowStore: WorkflowState
): Promise<void> {
  const store = useWorkflowStore.getState()
  store.setIsExecuting(true)

  try {
    const order = getExecutionOrder(store.nodes, store.connections)

    for (const nodeId of order) {
      const currentStore = useWorkflowStore.getState()
      const node = currentStore.nodes.find((n) => n.id === nodeId)
      if (!node) continue

      // Skip nodes already in error from cycle detection
      if (node.status === 'error') continue

      await executeNode(nodeId, currentStore)
    }
  } finally {
    const currentStore = useWorkflowStore.getState()
    currentStore.setIsExecuting(false)
    currentStore.setExecutingNodeId(null)
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
    currentStore.setExecutingNodeId(null)
  }
}
