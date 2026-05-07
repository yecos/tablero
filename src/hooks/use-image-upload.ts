import { useRef, useCallback, useEffect } from 'react'
import type { DesignElement } from '@/store/design-store'
import { getDefaultConnectionPoints } from './use-canvas-connections'
import { toast } from 'sonner'

// Utility: Compress an image file to a data URL with max dimensions and JPEG compression
export function compressImageFile(file: File, maxDim: number = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      if (!dataUrl) { reject(new Error('No data URL')); return }

      const img = new Image()
      img.onerror = () => {
        console.warn('Image load failed, using original data URL')
        resolve(dataUrl)
      }
      img.onload = () => {
        try {
          const ratio = Math.min(maxDim / img.width, maxDim / img.height, 1)
          const w = Math.round(img.width * ratio)
          const h = Math.round(img.height * ratio)
          const canvas = document.createElement('canvas')
          canvas.width = w
          canvas.height = h
          const ctx = canvas.getContext('2d')
          if (!ctx) { resolve(dataUrl); return }
          ctx.drawImage(img, 0, 0, w, h)
          const compressed = canvas.toDataURL('image/jpeg', 0.85)
          resolve(compressed)
        } catch {
          console.warn('Canvas compression failed, using original')
          resolve(dataUrl)
        }
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
  })
}

export interface UseImageUploadParams {
  canvasRef: React.RefObject<HTMLDivElement | null>
  activeTool: string
  panX: number
  panY: number
  zoom: number
  addElement: (element: DesignElement) => void
  updateElement: (id: string, updates: Partial<DesignElement>) => void
  setActiveTool: (tool: string) => void
}

export interface UseImageUploadReturn {
  fileInputRef: React.RefObject<HTMLInputElement | null>
  fileInput3DRef: React.RefObject<HTMLInputElement | null>
  addImageFileToCanvas: (file: File, dropX?: number, dropY?: number, as3D?: boolean) => void
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  handle3DUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function useImageUpload(params: UseImageUploadParams): UseImageUploadReturn {
  const {
    canvasRef: _canvasRef,
    activeTool,
    panX: _panX,
    panY: _panY,
    zoom: _zoom,
    addElement,
    updateElement,
    setActiveTool,
  } = params

  const fileInputRef = useRef<HTMLInputElement>(null)
  const fileInput3DRef = useRef<HTMLInputElement>(null)

  // Helper: add an image file to the canvas with compression
  const addImageFileToCanvas = useCallback(async (file: File, dropX?: number, dropY?: number, as3D: boolean = false) => {
    if (!file.type.startsWith('image/')) {
      toast.error(`${file.name} is not an image file`)
      return
    }

    try {
      const compressedSrc = await compressImageFile(file, 1024)

      const img = new Image()
      img.onload = () => {
        const maxDim = 500
        const ratio = Math.min(maxDim / img.width, maxDim / img.height, 1)
        const width = img.width * ratio
        const height = img.height * ratio

        const x = dropX !== undefined ? dropX - width / 2 : 5000 - width / 2 + Math.random() * 100 - 50
        const y = dropY !== undefined ? dropY - height / 2 : 5000 - height / 2 + Math.random() * 100 - 50

        if (as3D) {
          // Create as a 3D node directly
          const nodeWidth = 280
          const nodeHeight = 320
          const newElement: DesignElement = {
            id: `3d_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            type: '3d',
            x: dropX !== undefined ? dropX - nodeWidth / 2 : 4900,
            y: dropY !== undefined ? dropY - nodeHeight / 2 : 4900,
            width: nodeWidth,
            height: nodeHeight,
            rotation: 0,
            content: file.name,
            src: compressedSrc,
            selected: false,
            locked: false,
            visible: true,
            opacity: 1,
            isGenerating3D: true,
            connectionPoints: getDefaultConnectionPoints(nodeWidth, nodeHeight),
          }
          addElement(newElement)
          toast.info('Converting image to 3D...', { id: 'gen-3d' })

          // Trigger 3D conversion
          fetch('/api/image-to-3d', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: compressedSrc }),
          })
            .then(res => res.json())
            .then(data => {
              if (data.modelData) {
                updateElement(newElement.id, {
                  modelData: data.modelData,
                  isGenerating3D: false,
                })
                if (data.fallback) {
                  toast.info('Using placeholder 3D model', { id: 'gen-3d' })
                } else {
                  toast.success('3D model generated!', { id: 'gen-3d' })
                }
              }
            })
            .catch((err) => {
              updateElement(newElement.id, { isGenerating3D: false })
              const message = err instanceof Error ? err.message : 'Error desconocido'
              toast.error(`Error en generación 3D: ${message}`, { id: 'gen-3d' })
            })
        } else {
          addElement({
            id: `upload_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            type: 'image',
            x, y, width, height, rotation: 0,
            content: file.name,
            src: compressedSrc,
            selected: false, locked: false, visible: true, opacity: 1,
          })
          toast.success(`${file.name} added to canvas`)
        }
      }
      img.onerror = () => {
        addElement({
          id: `upload_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          type: 'image',
          x: dropX !== undefined ? dropX - 200 : 4800,
          y: dropY !== undefined ? dropY - 150 : 4850,
          width: 400, height: 300, rotation: 0,
          content: file.name,
          src: compressedSrc,
          selected: false, locked: false, visible: true, opacity: 1,
        })
        toast.success(`${file.name} added to canvas`)
      }
      img.src = compressedSrc
    } catch (err) {
      console.error('Failed to process image:', err)
      toast.error(`Failed to process ${file.name}`)
    }
  }, [addElement, updateElement])

  // Image upload handler
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    Array.from(files).forEach((file) => {
      addImageFileToCanvas(file)
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [addImageFileToCanvas])

  // 3D upload handler
  const handle3DUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    Array.from(files).forEach((file) => {
      addImageFileToCanvas(file, undefined, undefined, true)
    })
    if (fileInput3DRef.current) {
      fileInput3DRef.current.value = ''
    }
  }, [addImageFileToCanvas])

  // Handle toolbar Image tool click
  useEffect(() => {
    if (activeTool === 'image' && fileInputRef.current) {
      fileInputRef.current.click()
      setActiveTool('select')
    }
    if (activeTool === '3d' && fileInput3DRef.current) {
      fileInput3DRef.current.click()
      setActiveTool('select')
    }
  }, [activeTool, setActiveTool])

  return {
    fileInputRef,
    fileInput3DRef,
    addImageFileToCanvas,
    handleImageUpload,
    handle3DUpload,
  }
}
