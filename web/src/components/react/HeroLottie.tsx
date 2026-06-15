import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function HeroLottie() {
  return (
    <div className="w-full h-full pointer-events-none">
      <DotLottieReact
        src="/assets/hero-animation.lottie?v=3"
        loop
        autoplay
        className="w-full h-full object-contain"
      />
    </div>
  );
}
