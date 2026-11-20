import { motion, useReducedMotion } from 'motion/react';
import { useMemo } from 'react';

const COLORS = ['#b6ff5c', '#22d3ee', '#8b5cf6', '#ffc94d', '#ec4899', '#ffffff'];

/** Explosão de confete. Troque a `burst` para disparar de novo. */
export function Confetti({ burst, amount = 26 }: { burst: number; amount?: number }) {
  const reduce = useReducedMotion();
  const pieces = useMemo(
    () =>
      Array.from({ length: amount }, (_, i) => {
        const angle = (Math.PI * 2 * i) / amount + Math.random() * 0.5;
        const distance = 120 + Math.random() * 160;
        return {
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance - 80,
          rotate: Math.random() * 720 - 360,
          color: COLORS[i % COLORS.length],
          delay: Math.random() * 0.08,
        };
      }),
    [burst, amount],
  );
  if (reduce || burst === 0) return null;
  return (
    <div className="confetti" aria-hidden="true" key={burst}>
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          style={{ background: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.4, rotate: 0 }}
          animate={{ x: p.x, y: [0, p.y, p.y + 260], opacity: [1, 1, 0], scale: 1, rotate: p.rotate }}
          transition={{ duration: 1.3, delay: p.delay, ease: [0.2, 0.7, 0.4, 1] }}
        />
      ))}
    </div>
  );
}
