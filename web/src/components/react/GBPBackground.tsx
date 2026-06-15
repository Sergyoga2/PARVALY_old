import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';

export default function GBPBackground() {
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
          brightness={1.6}
          cAzimuthAngle={170}
          cDistance={4.4}
          cPolarAngle={70}
          cameraZoom={1}
          color1="#d4ffee"
          color2="#c8f8ff"
          color3="#ffffff"
          envPreset="city"
          grain="off"
          lightType="3d"
          positionX={0}
          positionY={0.9}
          positionZ={-0.3}
          range="disabled"
          rangeEnd={40}
          rangeStart={0}
          reflection={0.1}
          rotationX={45}
          rotationY={0}
          rotationZ={0}
          shader="defaults"
          type="waterPlane"
          uAmplitude={0}
          uDensity={1.2}
          uFrequency={0}
          uSpeed={0.2}
          uStrength={3.4}
          uTime={0}
          wireframe={false}
        />
      </ShaderGradientCanvas>
    </div>
  );
}
