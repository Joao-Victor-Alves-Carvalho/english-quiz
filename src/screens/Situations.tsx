import { motion } from 'motion/react';
import type { Situation } from '../lib/chat';
import { IconArrowLeft } from '../components/Icons';
import { isUnlocked, myTurns } from '../lib/chat';
import type { Progress } from '../lib/progress';

interface Props {
  list: Situation[];
  title: string;
  intro: string;
  progress: Progress;
  seenWords: number;
  onOpen: (id: string) => void;
  onBack: () => void;
}

export function Situations({ list, title, intro, progress, seenWords, onOpen, onBack }: Props) {
  return (
    <section className="screen" aria-label={title}>
      <div className="topbar">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Voltar">
          <IconArrowLeft />
        </button>
        <h1 className="page-title">{title}</h1>
      </div>
      <p className="muted" style={{ margin: 0 }}>
        {intro}
      </p>
      <ul className="situation-list">
        {list.map((s, i) => {
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
