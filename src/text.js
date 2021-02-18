// from https://codesandbox.io/s/texture-loader-k1iob?file=/src/resources/Text.js:0-1169

import { FontLoader, Vector3 } from 'three'
import React, { useMemo, useCallback } from 'react'
import { useLoader } from 'react-three-fiber'

export default function Text({ children, lineHeight = 1, size = 1, left = false, color = 'white', opacity = 1, ...props }) {
  const font = useLoader(FontLoader, '/bold.blob')
  const config = useMemo(() => ({ font, size: 1, height: 0.01, curveSegments: 32 }), [font])
  const lines = useMemo(() => children.split('\n'), [children])
  const onUpdate = useCallback((self) => {
    const size = new Vector3()
    self.geometry.computeBoundingBox()
    self.geometry.boundingBox.getSize(size)
    if (!left) self.position.x = -size.x / 2
    self.position.y = -size.y / 2
  }, [])
  return (
    <group {...props} scale={[0.1 * size, 0.1 * size, 0.1]}>
      {lines.map((text, index) => (
        <group key={index} position={[0, -index * 1 * lineHeight, 0]}>
          <mesh onUpdate={onUpdate}>
            <textGeometry attach="geometry" args={[text, config]} />
            <meshBasicMaterial attach="material" color={color} transparent opacity={opacity} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
