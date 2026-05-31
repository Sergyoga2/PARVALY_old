import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Float, Icosahedron, MeshDistortMaterial } from '@react-three/drei';
import { useReducedMotion } from 'motion/react';

/**
 * Lightweight 3D accent: a slowly rotating, gently distorted icosahedron in the
 * brand accent color. Mounted ONLY on the client (guarded) so the static build /
 * SSR never tries to create a WebGL context. Hydrated via client:visible.
 * Falls back to a soft gradient orb for reduced-motion users or before mount.
 */
function Fallback() {
  return (
    <div
      aria-hidden="true"
      className="h-[320px] w-full rounded-xl2 bg-[radial-gradient(circle_at_50%_40%,#60a5fa_0%,#2563eb_45%,#1e3a8a_100%)] opacity-80 blur-[2px]"
    />
  );
}

export default function Hero3D() {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || reduce) {
    return <Fallback />;
  }

  return (
    <div className="h-[320px] w-full" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 3, 5]} intensity={1.4} />
        <directionalLight position={[-4, -2, -3]} intensity={0.5} color="#93c5fd" />
        <Float speed={1.4} rotationIntensity={1.1} floatIntensity={1.2}>
          <Icosahedron args={[1.25, 4]}>
            <MeshDistortMaterial
              color="#2563eb"
              emissive="#1d4ed8"
              emissiveIntensity={0.25}
              roughness={0.18}
              metalness={0.55}
              distort={0.32}
              speed={1.6}
            />
          </Icosahedron>
        </Float>
      </Canvas>
    </div>
  );
}
