import { motion } from 'motion/react';
import { stories } from '../data/stories';
import { IconArrowLeft } from '../components/Icons';
import type { Progress } from '../lib/progress';

export function Stories({ progress, seenWords, onOpen, onBack }: { progress: Progress; seenWords: number; onOpen: (id: string) => void; onBack: () => void }) {
  return (
    <section className="screen" aria-label="Histórias">
      <div className="topbar">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Voltar">
          <IconArrowLeft />
        </button>
        <h1 className="page-title">Histórias</h1>
      </div>
      <p className="muted" style={{ margin: 0 }}>
        Textos curtos com as palavras que você está aprendendo. Ouça, leia, toque numa frase para ver a tradução e responda 3 perguntas no fim. Novas histórias liberam conforme você aprende palavras.
      </p>
      <ul className="situation-list">
        {stories.map((s, i) => {
          const open = seenWords >= s.unlockAt;
          const rec = progress.stories[s.id];
          return (
            <motion.li key={s.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <button type="button" className={`situation glass${open ? '' : ' locked'}`} disabled={!open} onClick={() => onOpen(s.id)}>
                <span className="avatar" aria-hidden="true">
                  {open ? s.emoji : '🔒'}
                </span>
                <span className="texts">
                  <strong>{s.title}</strong>
                  <span>{open ? `${s.subtitle} · ${s.sentences.length} frases` : `Libera com ${s.unlockAt} palavras (faltam ${s.unlockAt - seenWords})`}</span>
                </span>
                {rec && (
                  <span className="mini-stars" aria-label={`Melhor resultado: ${rec.best} de ${s.questions.length} acertos`}>
                    {'★'.repeat(rec.best)}
                    <span className="off">{'★'.repeat(Math.max(0, s.questions.length - rec.best))}</span>
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
