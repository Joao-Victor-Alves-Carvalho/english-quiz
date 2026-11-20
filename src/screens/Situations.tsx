import { motion } from 'motion/react';
import { situations } from '../data/situations';
import { IconArrowLeft } from '../components/Icons';
import { isUnlocked, myTurns } from '../lib/chat';
import type { Progress } from '../lib/progress';

export function Situations({ progress, seenWords, onOpen, onBack }: { progress: Progress; seenWords: number; onOpen: (id: string) => void; onBack: () => void }) {
  return (
    <section className="screen" aria-label="Situações reais">
      <div className="topbar">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Voltar">
          <IconArrowLeft />
        </button>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, letterSpacing: '-0.04em', flex: 1 }}>Situações reais</h1>
      </div>
      <p className="muted" style={{ margin: 0 }}>
        Conversas do dia a dia, como no WhatsApp. Escolha ou monte suas respostas, ou fale no microfone. Novas situações liberam conforme você aprende palavras.
      </p>
      <ul className="situation-list">
        {situations.map((s, i) => {
          const open = isUnlocked(s, seenWords);
          const rec = progress.situations[s.id];
          return (
            <motion.li key={s.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <button type="button" className={`situation glass${open ? '' : ' locked'}`} disabled={!open} onClick={() => onOpen(s.id)}>
                <span className="avatar" aria-hidden="true">
                  {open ? s.emoji : '🔒'}
                </span>
                <span className="texts">
                  <strong>{s.title}</strong>
                  <span>
                    {open
                      ? `${s.subtitle} · ${myTurns(s)} respostas`
                      : `Libera com ${s.unlockAt} palavras (faltam ${s.unlockAt - seenWords})`}
                  </span>
                </span>
                {rec && (
                  <span className="mini-stars" aria-label={`Melhor resultado: ${rec.best} de 3 estrelas`}>
                    {'★'.repeat(rec.best)}
                    <span className="off">{'★'.repeat(3 - rec.best)}</span>
                  </span>
                )}
              </button>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
