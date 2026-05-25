'use client';

import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { Suspense } from 'react';

export function BoardCanvas() {
  return (
    <Canvas camera={{ position: [0, 6, 6], fov: 40 }} shadows>
      <Suspense fallback={null}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[4, 8, 4]} intensity={1.2} castShadow />
        <Environment preset="studio" />
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[4, 4]} />
          <meshStandardMaterial color="#e7e9ed" roughness={0.5} metalness={0.05} />
        </mesh>
      </Suspense>
    </Canvas>
  );
}
