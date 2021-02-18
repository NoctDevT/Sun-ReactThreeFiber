import * as THREE from 'three'
import React, { useRef, useState, Suspense, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useLoader, extend, useThree } from 'react-three-fiber'
import { BackSide } from 'three'

import { Stars } from '@react-three/drei'

import fragmentSun from './shaders/fragmentSun.glsl'
import vertexSun from './shaders/vertexSun.glsl'
import fragment from './shaders/fragment.glsl'
import vertex from './shaders/vertex.glsl'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { PixelShader } from 'three/examples/jsm/shaders/PixelShader.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'

import { postProcessing } from './postProcessing/postProcessing'

import Text from './text'

extend({
  EffectComposer,
  ShaderPass,
  RenderPass,
  PixelShader,
  UnrealBloomPass
})

function SunTexture() {
  const [cubeRenderTarget] = useState(
    new THREE.WebGLCubeRenderTarget(256, {
      format: THREE.RGBFormat,
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter,
      encoding: THREE.sRGBEncoding
    })
  )
  const ref = useRef()
  const camera = useRef()

  const [updated, setUpdated] = useState(false)

  const uniforms = useMemo(
    () => ({
      time: { type: 'f', value: 0 },
      resolution: { type: 'v4', value: new THREE.Vector4() }
    }),
    []
  )

  useFrame(({ clock, gl, scene }) => {
    const t = clock.getElapsedTime()
    ref.current.material.uniforms.time.value = t * 5
    if (updated === false) {
      camera.current.update(gl, scene)
      setUpdated(true)
    }
    this.texture = cubeRenderTarget.texture
  })

  return (
    <>
      <cubeCamera ref={camera} args={[0.1, 10, cubeRenderTarget]} />
      <mesh ref={ref} scale={[1, 1, 1]}>
        <sphereBufferGeometry attach="geometry" args={[1, 10, 10]} />
        {/* <sphereBufferGeometry attach="geometry" args={[2, 10, 10]} /> */}
        {/* <sphereBufferGeometry attach="geometry" args={[2, 20, 20]} /> */}

        <shaderMaterial
          attach="material"
          uniforms={uniforms}
          fragmentShader={fragment}
          vertexShader={vertex}
          envMap={cubeRenderTarget.texture}
          extensions="#extension GL_OES_standard_derivatives : enable"
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  )
}

function Effects() {
  const composer = useRef()
  const shaderRef = useRef()
  const { scene, gl, size, camera } = useThree()
  useEffect(() => void composer.current.setSize(size.width, size.height), [size])

  const timeRef = useRef(0)

  useFrame(() => {
    timeRef.current += 0.001
    shaderRef.current.uniforms.time.value = timeRef.current
    composer.current.render()
  }, 1)

  return (
    <effectComposer ref={composer} args={[gl]}>
      <renderPass attachArray="passes" scene={scene} camera={camera} />
      <unrealBloomPass attachArray="passes" args={[undefined, 0.8, 1, 0.5]} />
      <shaderPass
        ref={shaderRef}
        attachArray="passes"
        args={[postProcessing]}
        material-uniforms-resolution-value={[1 / size.width, 2 / size.height]}
        material-uniforms-time-value={[timeRef.current]}
      />
    </effectComposer>
  )
}

export default function App() {
  return (
    <Canvas colorManagement pixelRatio={window.devicePixelRatio} camera={{ position: [0, 0, 2] }}>
      <SunObject />
      <SunTexture />
      <Effects />
      <Stars />
      {/* <Texts /> */}
    </Canvas>
  )
}

const Texts = () => {
  return (
    <Suspense fallback={null}>
      <Text left size={3 / 12} position={[0, 0, 1]} children={'Little trees and bushes\ngrow however makes them happy.'} />
    </Suspense>
  )
}

function SunObject() {
  const mesh = useRef()
  const uniforms = useMemo(
    () => ({
      time: { type: 'f', value: 0 },
      uPerlin: { value: null },
      resolution: { type: 'v4', value: new THREE.Vector4() },
      uvRate1: {
        value: new THREE.Vector2(1, 1)
      }
    }),
    []
  )

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    mesh.current.material.uniforms.time.value = t * 5
    mesh.current.material.uniforms.uPerlin.value = this.texture
  })
  return (
    <mesh ref={mesh}>
      <sphereBufferGeometry attach="geometry" args={[1, 30, 30]} />
      <shaderMaterial attach="material" uniforms={uniforms} fragmentShader={fragmentSun} vertexShader={vertexSun} />
    </mesh>
  )
}
