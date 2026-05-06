'use client'

import { useRef, Suspense, useMemo, useState, useEffect } from 'react'
import { Canvas, useLoader } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import * as THREE from 'three'

interface ModelProps {
  modelData?: string
  modelUrl?: string
}

function FallbackCube() {
  const meshRef = useRef<THREE.Mesh>(null)

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    let animId: number
    const animate = () => {
      mesh.rotation.y += 0.005
      mesh.rotation.x += 0.002
      animId = requestAnimationFrame(animate)
    }
    animId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1.2, 1.2, 1.2]} />
      <meshStandardMaterial
        color="#8b5cf6"
        metalness={0.3}
        roughness={0.6}
      />
    </mesh>
  )
}

function SpinningPlaceholder() {
  const meshRef = useRef<THREE.Mesh>(null)

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    let animId: number
    const animate = () => {
      mesh.rotation.y += 0.01
      animId = requestAnimationFrame(animate)
    }
    animId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <mesh ref={meshRef}>
      <octahedronGeometry args={[0.8, 0]} />
      <meshStandardMaterial
        color="#22d3ee"
        wireframe
        emissive="#22d3ee"
        emissiveIntensity={0.3}
      />
    </mesh>
  )
}

function GLBModel({ modelData, modelUrl }: ModelProps) {
  // We need to dynamically load the GLB - can't use useLoader with conditional
  const [object, setObject] = useState<THREE.Group | null>(null)
  const [error, setError] = useState(false)
  const groupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    let cancelled = false

    async function loadModel() {
      try {
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
        const loader = new GLTFLoader()

        if (modelData) {
          // Load from base64
          const binaryString = atob(modelData)
          const bytes = new Uint8Array(binaryString.length)
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
          }
          const blob = new Blob([bytes], { type: 'model/gltf-binary' })
          const url = URL.createObjectURL(blob)

          loader.load(
            url,
            (gltf) => {
              if (!cancelled) {
                // Auto-scale the model to fit
                const box = new THREE.Box3().setFromObject(gltf.scene)
                const size = box.getSize(new THREE.Vector3())
                const maxDim = Math.max(size.x, size.y, size.z)
                const scale = maxDim > 0 ? 1.5 / maxDim : 1
                gltf.scene.scale.setScalar(scale)

                // Center the model
                const center = box.getCenter(new THREE.Vector3())
                gltf.scene.position.sub(center.multiplyScalar(scale))

                setObject(gltf.scene)
                URL.revokeObjectURL(url)
              }
            },
            undefined,
            (err) => {
              console.error('GLB load error:', err)
              if (!cancelled) setError(true)
              URL.revokeObjectURL(url)
            }
          )
        } else if (modelUrl) {
          loader.load(
            modelUrl,
            (gltf) => {
              if (!cancelled) {
                const box = new THREE.Box3().setFromObject(gltf.scene)
                const size = box.getSize(new THREE.Vector3())
                const maxDim = Math.max(size.x, size.y, size.z)
                const scale = maxDim > 0 ? 1.5 / maxDim : 1
                gltf.scene.scale.setScalar(scale)

                const center = box.getCenter(new THREE.Vector3())
                gltf.scene.position.sub(center.multiplyScalar(scale))

                setObject(gltf.scene)
              }
            },
            undefined,
            (err) => {
              console.error('GLB load error:', err)
              if (!cancelled) setError(true)
            }
          )
        }
      } catch (err) {
        console.error('Failed to load GLB:', err)
        if (!cancelled) setError(true)
      }
    }

    loadModel()
    return () => { cancelled = true }
  }, [modelData, modelUrl])

  // Auto rotate
  useEffect(() => {
    const group = groupRef.current
    if (!group) return
    let animId: number
    const animate = () => {
      group.rotation.y += 0.003
      animId = requestAnimationFrame(animate)
    }
    animId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animId)
  }, [object])

  if (error) {
    return <FallbackCube />
  }

  if (!object) {
    return <SpinningPlaceholder />
  }

  return (
    <group ref={groupRef}>
      <primitive object={object} />
    </group>
  )
}

function Scene({ modelData, modelUrl }: ModelProps) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-5, -5, -5]} intensity={0.3} />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#8b5cf6" />
      <pointLight position={[0, -5, 0]} intensity={0.3} color="#22d3ee" />
      <Suspense fallback={<SpinningPlaceholder />}>
        {(modelData || modelUrl) ? (
          <GLBModel modelData={modelData} modelUrl={modelUrl} />
        ) : (
          <FallbackCube />
        )}
      </Suspense>
      <Environment preset="studio" />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate={false}
        maxPolarAngle={Math.PI * 0.85}
        minPolarAngle={Math.PI * 0.15}
      />
    </>
  )
}

interface ModelViewer3DProps {
  modelData?: string
  modelUrl?: string
  className?: string
}

export function ModelViewer3D({ modelData, modelUrl, className }: ModelViewer3DProps) {
  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Scene modelData={modelData} modelUrl={modelUrl} />
      </Canvas>
    </div>
  )
}
