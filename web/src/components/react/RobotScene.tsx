import { SplineScene } from '@/components/ui/splite';
import { Card } from '@/components/ui/card';
import { Spotlight } from '@/components/ui/spotlight';

// Interactive robot that follows the cursor, in a dark spotlight card.
// Sits in the hero's right column. Hydrated via client:visible (heavy WebGL).
export default function RobotScene() {
  return (
    <Card className="relative h-[460px] w-full overflow-hidden border-0 bg-black/[0.96]">
      <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" fill="white" />
      <SplineScene
        scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
        className="h-full w-full"
      />
    </Card>
  );
}
