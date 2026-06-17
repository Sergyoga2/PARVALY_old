import { useEffect, useRef } from 'react';

const DURATION = 380; // ms — скорость листания

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function animateScrollTo(targetY: number, duration: number, onDone: () => void) {
  const startY = window.scrollY;
  const diff = targetY - startY;
  let startTime: number | null = null;

  function step(ts: number) {
    if (startTime === null) startTime = ts;
    const elapsed = ts - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startY + diff * easeInOutCubic(progress));
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      onDone();
    }
  }

  requestAnimationFrame(step);
}

export default function SnapScrollController() {
  const locked = useRef(false);
  const touchStartY = useRef(0);

  useEffect(() => {
    const vh = () => window.innerHeight;

    function goTo(direction: 1 | -1) {
      if (locked.current) return;
      const current = Math.round(window.scrollY / vh());
      const target = current + direction;
      const maxBlock = Math.floor((document.body.scrollHeight - 1) / vh());
      if (target < 0 || target > maxBlock) return;
      locked.current = true;
      animateScrollTo(target * vh(), DURATION, () => {
        locked.current = false;
      });
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      goTo(e.deltaY > 0 ? 1 : -1);
    }

    function onTouchStart(e: TouchEvent) {
      touchStartY.current = e.touches[0].clientY;
    }

    function onTouchEnd(e: TouchEvent) {
      const delta = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(delta) > 40) goTo(delta > 0 ? 1 : -1);
    }

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return null;
}
