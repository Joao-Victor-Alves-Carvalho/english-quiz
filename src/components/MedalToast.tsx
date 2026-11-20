import { AnimatePresence, motion } from 'motion/react';
import { useEffect } from 'react';
import type { Medal } from '../lib/medals';
import { playComplete } from '../lib/sfx';
import { vibrate } from '../lib/speech';

/** Aviso de medalha nova, um de cada vez, no topo da tela. */
export function MedalToast({ queue, onDone, sound }: { queue: Medal[]; onDone: () => void; sound: boolean }) {
  const current = queue[0];

  useEffect(() => {
    if (!current) return;
    if (sound) playComplete();
    // O navegador só deixa vibrar depois do primeiro toque na tela.
    if ((navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation?.hasBeenActive) vibrate([30, 40, 30]);
    const timer = setTimeout(onDone, 3600);
    return () => clearTimeout(timer);
  }, [current]);

  return (
    <div className="toast-wrap" aria-live="polite">
      <AnimatePresence>
        {current && (
          <motion.button
            key={current.id}
            type="button"
            className="toast"
            onClick={onDone}
            initial={{ y: -80, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          >
            <motion.span className="toast-emoji" initial={{ rotate: -30, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ delay: 0.15, type: 'spring' }}>
              {current.emoji}
            </motion.span>
            <span>
              <small>Nova medalha!</small>
              <strong>{current.title}</strong>
              <span className="muted">{current.desc}</span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
