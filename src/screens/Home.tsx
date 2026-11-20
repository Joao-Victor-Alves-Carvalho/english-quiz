import { motion } from 'motion/react';
import { packs } from '../data/packs';
import { IconFlame, IconList } from '../components/Icons';
import { currentStreak, masteredRatio, UNLOCK_RATIO, type Progress } from '../lib/progress';
import { MASTERED_BOX } from '../lib/srs';

interface Props {
  progress: Progress;
  dueCount: number;
  newCount: number;
  unlockedCount: number;
  onStart: () => void;
  onExtra: () => void;
  onWords: () => void;
  onToggleAudio: () => void;
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

const enter = (i: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.06 * i, type: 'spring' as const, stiffness: 220, damping: 24 },
});

export function Home({ progress, dueCount, newCount, unlockedCount, onStart, onExtra, onWords, onToggleAudio }: Props) {
  const streak = currentStreak(progress, Date.now());
  const hasWork = dueCount + newCount > 0;
  const seenAny = Object.keys(progress.cards).length > 0;

  return (
    <section className="screen" aria-label="Início">
      <motion.header className="row" {...enter(0)}>
        <h1 className="logo">
          miller <span>minute.</span>
        </h1>
        <span className="spacer" />
        <span className="pill" title="Dias seguidos estudando">
          <IconFlame />
          {streak}
          <span className="sr-only">dias seguidos</span>
        </span>
      </motion.header>

      <motion.div className="hero glass" {...enter(1)}>
        <div>
          <p className="eyebrow">{greeting()}, João</p>
          <h2 style={{ marginTop: 10 }}>{hasWork ? 'Bora treinar?' : 'Tudo em dia!'}</h2>
        </div>
        <div className="stats">
          <div className="stat">
            <strong>{dueCount}</strong>
            <span>revisões</span>
          </div>
          <div className="stat">
            <strong>{newCount}</strong>
            <span>novas hoje</span>
          </div>
          <div className="stat">
            <strong>{progress.totalAnswers > 0 ? Math.round((progress.totalCorrect / progress.totalAnswers) * 100) : 0}%</strong>
            <span>acertos</span>
          </div>
        </div>
        {hasWork ? (
          <motion.button
            type="button"
            className="btn btn-primary btn-block"
            onClick={onStart}
            whileTap={{ scale: 0.96 }}
            animate={{ boxShadow: ['0 10px 40px -10px rgba(139,92,246,.7)', '0 10px 50px -6px rgba(34,211,238,.7)', '0 10px 40px -10px rgba(139,92,246,.7)'] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {seenAny ? 'Começar sessão' : 'Começar do zero'}
          </motion.button>
        ) : (
          <>
            <p className="muted" style={{ margin: 0 }}>
              Você revisou tudo o que estava pendente. As próximas revisões chegam amanhã.
            </p>
            {seenAny && (
              <button type="button" className="btn btn-ghost btn-block" onClick={onExtra}>
                Treino extra (não conta no agendamento)
              </button>
            )}
          </>
        )}
      </motion.div>

      {packs.map((pack, i) => {
        const locked = i >= unlockedCount;
        const total = pack.items.length;
        let learning = 0;
        let mastered = 0;
        for (const item of pack.items) {
          const card = progress.cards[item.id];
          if (!card) continue;
          if (card.box >= MASTERED_BOX) mastered++;
          else learning++;
        }
        const ratio = masteredRatio(pack, progress.cards);
        return (
          <motion.div key={pack.id} className={`pack glass${locked ? ' locked' : ''}`} {...enter(2 + i)}>
            <div className="row">
              <div style={{ flex: 1 }}>
                <p className="eyebrow">Pacote {i + 1}</p>
                <h3>{pack.title}</h3>
              </div>
              <strong style={{ fontSize: 22 }}>{Math.round(ratio * 100)}%</strong>
            </div>
            <p className="muted" style={{ margin: 0, fontSize: 14 }}>
              {locked ? `Libera com ${Math.round(UNLOCK_RATIO * 100)}% do pacote anterior dominado.` : pack.subtitle}
            </p>
            <div className="meter" aria-hidden="true">
              <motion.span style={{ background: 'var(--good)' }} initial={{ width: 0 }} animate={{ width: `${(mastered / total) * 100}%` }} transition={{ duration: 0.9, delay: 0.3 }} />
              <motion.span style={{ background: 'var(--violet)' }} initial={{ width: 0 }} animate={{ width: `${(learning / total) * 100}%` }} transition={{ duration: 0.9, delay: 0.4 }} />
            </div>
            <div className="legend">
              <span><i style={{ background: 'var(--good)' }} />{mastered} dominadas</span>
              <span><i style={{ background: 'var(--violet)' }} />{learning} aprendendo</span>
              <span><i style={{ background: 'rgba(255,255,255,.15)' }} />{total - mastered - learning} novas</span>
            </div>
          </motion.div>
        );
      })}

      <motion.div className="row" style={{ marginTop: 'auto', paddingTop: 8 }} {...enter(4)}>
        <button type="button" className="btn btn-ghost" onClick={onWords} style={{ flex: 1 }}>
          <IconList width={20} height={20} /> Palavras
        </button>
        <button type="button" className="btn btn-ghost switch" role="switch" aria-checked={progress.settings.autoAudio} onClick={onToggleAudio}>
          Áudio <span className="track" aria-hidden="true" />
        </button>
      </motion.div>
    </section>
  );
}
