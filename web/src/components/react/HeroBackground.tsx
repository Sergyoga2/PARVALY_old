import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';

export default function HeroBackground() {
  return (
    <div className="absolute inset-0 z-0 w-full h-full">
      <ShaderGradientCanvas
        style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}
        fov={45}
        pixelDensity={1}
        lazyLoad={false}
      >
        <ShaderGradient
          animate="on"
          brightness={1.2}
          cAzimuthAngle={180}
          cDistance={2.9}
          cPolarAngle={120}
          cameraZoom={1}
          color1="#ebedff"
          color2="#f3f2f8"
          color3="#dbf8ff"
          envPreset="city"
          grain="off"
          lightType="3d"
          positionX={0}
          positionY={1.8}
          positionZ={0}
          range="disabled"
          rangeEnd={40}
          rangeStart={0}
          reflection={0.1}
          rotationX={0}
          rotationY={0}
          rotationZ={-90}
          shader="defaults"
          type="waterPlane"
          uAmplitude={0}
          uDensity={1}
          uFrequency={5.5}
          uSpeed={0.3}
          uStrength={3}
          uTime={0.2}
          wireframe={false}
        />
      </ShaderGradientCanvas>
    </div>
  );
}
