import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** delay in seconds for staggered reveals */
  delay?: number;
  className?: string;
}

/**
 * Reusable scroll-reveal wrapper. Fades + slides content up when it enters the
 * viewport. Honors prefers-reduced-motion (renders content statically).
 */
export default function ScrollReveal({ children, delay = 0, className }: Props) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
