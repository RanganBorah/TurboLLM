import React, { Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Icosahedron, Torus, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

type Icon3DShape = 'spark' | 'ring';

interface Icon3DProps {
  shape?: Icon3DShape;
  color?: string;
  size?: number;
}

function SpinningShape({ shape, color }: { shape: Icon3DShape; color: string }) {
  const ref = React.useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * 0.4;
    ref.current.rotation.y += delta * 0.6;
  });

  if (shape === 'ring') {
    return (
      <Torus ref={ref} args={[0.55, 0.18, 16, 48]}>
        <meshStandardMaterial color={color} roughness={0.25} metalness={0.6} />
      </Torus>
    );
  }

  return (
    <Icosahedron ref={ref} args={[0.7, 0]}>
      <MeshDistortMaterial color={color} roughness={0.2} metalness={0.4} distort={0.25} speed={1.5} />
    </Icosahedron>
  );
}

/**
 * Small self-contained 3D accent icon (React Three Fiber + drei). Sized to
 * sit inline with text/badges like a regular icon — not an interactive
 * scene, just a subtle rotating/floating shape.
 */
export const Icon3D: React.FC<Icon3DProps> = ({ shape = 'spark', color = '#818cf8', size = 28 }) => {
  return (
    <div style={{ width: size, height: size }} className="shrink-0">
      <Canvas camera={{ position: [0, 0, 3], fov: 40 }} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 2, 2]} intensity={1.2} />
        <Suspense fallback={null}>
          <Float speed={2} rotationIntensity={0.6} floatIntensity={0.8}>
            <SpinningShape shape={shape} color={color} />
          </Float>
        </Suspense>
      </Canvas>
    </div>
  );
};
