import { useEffect, useState } from 'react';
import Spline from '@splinetool/react-spline';
import { useReducedMotion } from 'motion/react';

// Spline scene: interactive robot that follows the cursor (behavior baked into
// the scene). Mounted ONLY on the client (guarded) so the static build / SSR
// never tries to create a WebGL context. Hydrated via client:visible.
const SCENE_URL = 'https://prod.spline.design/CpbCMzvfTqDwVPGH/scene.splinecode';

// Soft brand orb shown before the scene mounts and for reduced-motion users.
function Fallback() {
  return (
    <div
      aria-hidden="true"
      className="h-[440px] w-full rounded-xl2 bg-[radial-gradient(circle_at_50%_40%,#dbeafe_0%,#bfdbfe_45%,#eff6ff_100%)] opacity-70"
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
    <div className="relative h-[440px] w-full">
      <Spline scene={SCENE_URL} />
    </div>
  );
}
