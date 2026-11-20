import { motion } from 'motion/react';
import { packs } from '../data/packs';
import { situations } from '../data/situations';
import { isUnlocked } from '../lib/chat';
import { IconFlame, IconList, IconMic, IconSpeaker } from '../components/Icons';
import { currentStreak, masteredRatio, pausedMinutes, UNLOCK_RATIO, type PauseKind, type Progress } from '../lib/progress';
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
  onToggleSounds: () => void;
  onResume: (kind: PauseKind) => void;
  onSituations: () => void;
  seenWords: number;
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

export function Home(props: Props) {
  const { progress, dueCount, newCount, unlockedCount, onStart, onExtra, onWords, onToggleAudio, onToggleSounds, onResume, onSituations, seenWords } = props;
  const openSituations = situations.filter((s) => isUnlocked(s, seenWords)).length;
  const now = Date.now();
  const streak = currentStreak(progress, now);
  const micPaused = pausedMinutes(progress, 'mic', now);
  const audioPaused = pausedMinutes(progress, 'audio', now);
  const hasWork = dueCount + newCount > 0;
  const seenAny = Object.keys(progress.cards).length > 0;

  return (
    <section className="screen" aria-label="Início">
      <motion.header className="row" {...enter(0)}>
        <img className="logo-mark" src="./icon.svg" alt="" width={44} height={44} />
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

      <motion.button type="button" className="situations-card glass" onClick={onSituations} whileTap={{ scale: 0.98 }} {...enter(2)}>
        <span className="emojis" aria-hidden="true">
          🍝☕🎉
        </span>
        <span style={{ flex: 1 }}>
          <p className="eyebrow" style={{ marginBottom: 4 }}>
            Novo · conversas
          </p>
          <strong>Situações reais</strong>
          <span className="muted">
            {openSituations} de {situations.length} liberadas · restaurante, café, hotel…
          </span>
        </span>
        <span aria-hidden="true" style={{ fontSize: 22, color: 'var(--muted)' }}>
          ›
        </span>
      </motion.button>

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
          <motion.div key={pack.id} className={`pack glass${locked ? ' locked' : ''}`} {...enter(3 + i)}>
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

      <motion.div style={{ marginTop: 'auto', paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 10 }} {...enter(4)}>
        {micPaused > 0 && (
          <div className="pause-chip">
            <IconMic /> Perguntas de fala pausadas · {micPaused} min
            <button type="button" onClick={() => onResume('mic')}>Reativar</button>
          </div>
        )}
        {audioPaused > 0 && (
          <div className="pause-chip">
            <IconSpeaker /> Áudio pausado · {audioPaused} min
            <button type="button" onClick={() => onResume('audio')}>Reativar</button>
          </div>
        )}
        <div className="settings-row">
          <button type="button" className="btn btn-ghost" onClick={onWords}>
            <IconList width={18} height={18} /> Palavras
          </button>
          <button type="button" className="btn btn-ghost switch" role="switch" aria-checked={progress.settings.autoAudio} onClick={onToggleAudio}>
            Voz <span className="track" aria-hidden="true" />
          </button>
          <button type="button" className="btn btn-ghost switch" role="switch" aria-checked={progress.settings.sounds} onClick={onToggleSounds}>
            Sons <span className="track" aria-hidden="true" />
          </button>
        </div>
        <p className="version">Miller Minute v{__APP_VERSION__}</p>
      </motion.div>
    </section>
  );
}
