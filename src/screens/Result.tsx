import { animate, motion, useMotionValue, useTransform } from 'motion/react';
import { useEffect, useState } from 'react';
import { Confetti } from '../components/Confetti';
import { IconFlame } from '../components/Icons';
import { earthYearsIfOnMiller, formatEarth, formatMiller, formatStudy, millerSeconds } from '../lib/miller';
import { playComplete } from '../lib/sfx';
import type { Summary } from './Session';

function headline(pct: number): string {
  if (pct === 100) return 'Impecável!';
  if (pct >= 80) return 'Excelente!';
  if (pct >= 60) return 'Bom treino!';
  return 'Faz parte!';
}

export function Result({ summary, ms, streak, sound, onDone }: { summary: Summary; ms: number; streak: number; sound: boolean; onDone: () => void }) {
  const pct = summary.answered > 0 ? Math.round((summary.correct / summary.answered) * 100) : 0;
  const value = useMotionValue(0);
  const dash = useTransform(value, (v) => `${(v / 100) * 565} 565`);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (sound) playComplete();
    // Toca uma vez, ao abrir o resultado.
  }, []);

  useEffect(() => {
    const controls = animate(value, pct, { duration: 1.2, ease: [0.2, 0.8, 0.2, 1], onUpdate: (v) => setShown(Math.round(v)) });
    return () => controls.stop();
  }, [pct, value]);

  return (
    <section className="screen result" aria-label="Resultado da sessão">
      <motion.div className="ring" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 180, damping: 16 }}>
        <svg viewBox="0 0 200 200" aria-hidden="true">
          <defs>
            <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="60%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#b6ff5c" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="90" stroke="rgba(255,255,255,.08)" strokeWidth="16" fill="none" />
          <motion.circle cx="100" cy="100" r="90" stroke="url(#ringGrad)" strokeWidth="16" strokeLinecap="round" fill="none" style={{ strokeDasharray: dash }} />
        </svg>
        <div className="value">{shown}%</div>
      </motion.div>

      <motion.h1 className="result-title" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ margin: 0, fontSize: 40, fontWeight: 900, letterSpacing: '-0.05em' }}>
        {headline(pct)}
      </motion.h1>

      <motion.div className="stats" style={{ width: '100%' }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <div className="stat">
          <strong>{summary.correct}/{summary.answered}</strong>
          <span>acertos</span>
        </div>
        <div className="stat">
          <strong>{summary.newLearned}</strong>
          <span>novas</span>
        </div>
        <div className="stat">
          <strong>x{summary.bestCombo}</strong>
          <span>melhor combo</span>
        </div>
      </motion.div>

      {ms > 0 && (
        <motion.p className="miller-line result-miller" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
          🪐 Durante seus <strong>{formatStudy(ms)}</strong> de estudo, passaram só <strong>{formatMiller(millerSeconds(ms))}</strong> no planeta de Miller. Lá, esse tempo valeria{' '}
          <strong>{formatEarth(earthYearsIfOnMiller(ms))}</strong> aqui na Terra.
        </motion.p>
      )}

      <motion.p className="pill" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, type: 'spring' }}>
        <IconFlame /> {streak} {streak === 1 ? 'dia seguido' : 'dias seguidos'}
      </motion.p>

      <motion.button type="button" className="btn btn-primary btn-block" onClick={onDone} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }} autoFocus>
        Voltar ao início
      </motion.button>

      <Confetti burst={pct >= 60 ? 1 : 0} amount={60} />
    </section>
  );
}
