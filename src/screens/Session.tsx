import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { itemsById } from '../data/packs';
import type { Item } from '../data/types';
import type { Mood } from '../components/Aurora';
import { Confetti } from '../components/Confetti';
import { IconBolt, IconCheck, IconX } from '../components/Icons';
import { SpeakButton } from '../components/SpeakButton';
import { checkTyped } from '../lib/answer';
import { buildChoices } from '../lib/choices';
import { registerNewItems, type Progress } from '../lib/progress';
import { MAX_RETRIES_PER_ITEM, scheduleRetry, type Step } from '../lib/session';
import { speak, vibrate } from '../lib/speech';
import { grade, newCard, type Mode } from '../lib/srs';

export interface Summary {
  answered: number;
  correct: number;
  bestCombo: number;
  newLearned: number;
}

interface Props {
  steps: Step[];
  pool: Item[];
  progress: Progress;
  updateProgress: (fn: (p: Progress) => Progress) => void;
  setMood: (mood: Mood) => void;
  onFinish: (summary: Summary) => void;
  onExit: () => void;
}

interface Outcome {
  correct: boolean;
  typo: boolean;
  chosen: string | null;
}

const GOOD = ['Mandou bem!', 'Isso aí!', 'Perfeito!', 'Boa!', 'Na mosca!', 'Arrasou!'];
const BAD = ['Quase!', 'Não foi dessa vez', 'Bora de novo'];
const LABEL: Record<Mode, string> = {
  'en-pt-choice': 'O que significa?',
  'pt-en-choice': 'Como se diz em inglês?',
  'pt-en-type': 'Escreva em inglês',
};

const pick = (list: readonly string[]) => list[Math.floor(Math.random() * list.length)] ?? '';

export function Session({ steps, pool, progress, updateProgress, setMood, onFinish, onExit }: Props) {
  const [queue, setQueue] = useState(steps);
  const [index, setIndex] = useState(0);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [typed, setTyped] = useState('');
  const [combo, setCombo] = useState(0);
  const [burst, setBurst] = useState(0);
  const [title, setTitle] = useState('');
  const stats = useRef<Summary>({ answered: 0, correct: 0, bestCombo: 0, newLearned: 0 });
  const retries = useRef(new Map<string, number>());

  const step = queue[index];
  const item = step ? itemsById.get(step.itemId) : undefined;
  const autoAudio = progress.settings.autoAudio;

  const choices = useMemo(() => {
    if (!step || !item || step.kind !== 'quiz' || step.mode === 'pt-en-type') return [];
    return buildChoices(item, pool, Math.random, step.mode === 'en-pt-choice' ? 'pt' : 'en');
    // Fixas durante o passo: reagendar um erro muda a fila, mas não o passo atual.
  }, [index, step]);

  // Áudio automático ao mostrar uma palavra em inglês.
  useEffect(() => {
    if (!item || !autoAudio || outcome) return;
    if (step?.kind === 'intro' || step?.mode === 'en-pt-choice') speak(item.en);
  }, [index, step]);

  const finish = useCallback(() => {
    setMood('idle');
    onFinish({ ...stats.current });
  }, [onFinish, setMood]);

  const advance = useCallback(() => {
    setMood('idle');
    setOutcome(null);
    setTyped('');
    if (index + 1 >= queue.length) finish();
    else setIndex(index + 1);
  }, [finish, index, queue.length, setMood]);

  const continueIntro = useCallback(() => {
    if (!step) return;
    stats.current.newLearned += 1;
    updateProgress((p) => registerNewItems(p, Date.now(), 1));
    advance();
  }, [advance, step, updateProgress]);

  const answer = useCallback(
    (correct: boolean, chosen: string | null, typo = false) => {
      if (!step || !item || outcome) return;
      const now = Date.now();
      updateProgress((p) => {
        const next: Progress = {
          ...p,
          totalAnswers: p.totalAnswers + 1,
          totalCorrect: p.totalCorrect + (correct ? 1 : 0),
        };
        if (step.graded) {
          const card = p.cards[item.id] ?? newCard(now);
          next.cards = { ...p.cards, [item.id]: grade(card, correct, now) };
        }
        return next;
      });

      stats.current.answered += 1;
      if (correct) {
        stats.current.correct += 1;
        const nextCombo = combo + 1;
        setCombo(nextCombo);
        stats.current.bestCombo = Math.max(stats.current.bestCombo, nextCombo);
        setBurst((b) => b + 1);
        setTitle(typo ? 'Quase perfeito!' : pick(GOOD));
        vibrate(25);
      } else {
        setCombo(0);
        setTitle(pick(BAD));
        vibrate([70, 50, 70]);
        const used = retries.current.get(item.id) ?? 0;
        if (used < MAX_RETRIES_PER_ITEM) {
          retries.current.set(item.id, used + 1);
          setQueue((q) => scheduleRetry(q, index, step));
        }
      }
      setMood(correct ? 'correct' : 'wrong');
      setOutcome({ correct, typo, chosen });
      if (autoAudio && (step.mode !== 'en-pt-choice' || !correct)) speak(item.en);
    },
    [autoAudio, combo, index, item, outcome, setMood, step, updateProgress],
  );

  // Teclado: 1–4 escolhem, Enter continua.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement | null)?.tagName === 'INPUT') return;
      if (step?.kind === 'intro' && e.key === 'Enter') {
        e.preventDefault();
        continueIntro();
        return;
      }
      if (outcome && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        advance();
        return;
      }
      const n = Number(e.key);
      if (!outcome && n >= 1 && n <= choices.length && item && step) {
        const choice = choices[n - 1] ?? '';
        answer(choice === (step.mode === 'en-pt-choice' ? item.pt : item.en), choice);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [advance, answer, choices, continueIntro, item, outcome, step]);

  if (!step || !item) return null;

  const expected = step.mode === 'en-pt-choice' ? item.pt : item.en;
  const promptText = step.mode === 'en-pt-choice' ? item.en : item.pt;
  const pct = Math.round((index / queue.length) * 100);

  const onTypeSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (outcome) {
      advance();
      return;
    }
    if (typed.trim() === '') return;
    const result = checkTyped(typed, item.en);
    answer(result !== 'wrong', typed, result === 'typo');
  };

  return (
    <section className="screen" aria-label="Sessão de estudo">
      <div className="topbar">
        <button type="button" className="icon-btn" onClick={onExit} aria-label="Sair da sessão">
          <IconX />
        </button>
        <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso da sessão">
          <motion.div initial={false} animate={{ width: `${Math.max(4, pct)}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
        </div>
        <div className="combo" aria-live="polite">
          <AnimatePresence>
            {combo >= 2 && (
              <motion.span
                key={combo}
                className="row"
                style={{ justifyContent: 'center', gap: 2 }}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: [1.5, 1], opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <IconBolt width={16} height={16} /> x{combo}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${index}-${step.itemId}`}
          className="stage"
          initial={{ opacity: 0, y: 28, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -28, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        >
          {step.kind === 'intro' ? (
            <div className="intro-card glass">
              <span className="badge">Nova</span>
              <div className="row" style={{ alignItems: 'flex-start' }}>
                <h1 className={item.en.length > 14 ? 'prompt-word small' : 'prompt-word'} style={{ flex: 1 }}>
                  {item.en}
                </h1>
                <SpeakButton text={item.en} />
              </div>
              <p className="translation">{item.pt}</p>
              {item.ex && (
                <div className="example">
                  <div style={{ flex: 1 }}>
                    <p className="en">{item.ex}</p>
                    <p className="pt">{item.exPt}</p>
                  </div>
                  <SpeakButton text={item.ex} size="small" />
                </div>
              )}
              <button type="button" className="btn btn-primary btn-block" onClick={continueIntro} autoFocus>
                Entendi
              </button>
            </div>
          ) : (
            <>
              <div className="prompt">
                <p className="eyebrow">{LABEL[step.mode]}</p>
                <div className="row" style={{ alignItems: 'flex-start' }}>
                  <h1 className={promptText.length > 14 ? 'prompt-word small' : 'prompt-word'} style={{ flex: 1 }}>
                    {promptText}
                  </h1>
                  {step.mode === 'en-pt-choice' && <SpeakButton text={item.en} />}
                </div>
              </div>

              {step.mode === 'pt-en-type' ? (
                <form onSubmit={onTypeSubmit} className="options">
                  <motion.input
                    className={`type-input${outcome ? (outcome.correct ? ' is-correct' : ' is-wrong') : ''}`}
                    value={typed}
                    onChange={(e) => setTyped(e.target.value)}
                    placeholder="Digite aqui…"
                    aria-label="Sua resposta em inglês"
                    autoFocus
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    readOnly={outcome !== null}
                    animate={outcome && !outcome.correct ? { x: [0, -12, 12, -8, 8, 0] } : { x: 0 }}
                    transition={{ duration: 0.4 }}
                  />
                  {!outcome && (
                    <div className="row">
                      <button type="button" className="btn btn-ghost" onClick={() => answer(false, null)}>
                        Não sei
                      </button>
                      <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={typed.trim() === ''}>
                        Verificar
                      </button>
                    </div>
                  )}
                </form>
              ) : (
                <div className="options" role="group" aria-label="Alternativas">
                  {choices.map((choice, i) => {
                    const isAnswer = choice === expected;
                    const isChosen = outcome?.chosen === choice;
                    let cls = 'option';
                    if (outcome) {
                      if (isAnswer) cls += ' is-correct';
                      else if (isChosen) cls += ' is-wrong';
                      else cls += ' is-dim';
                    }
                    return (
                      <motion.button
                        key={choice}
                        type="button"
                        className={cls}
                        disabled={outcome !== null}
                        onClick={() => answer(isAnswer, choice)}
                        initial={{ opacity: 0, y: 14 }}
                        animate={
                          outcome && isChosen && !isAnswer
                            ? { opacity: 1, y: 0, x: [0, -12, 12, -8, 8, 0] }
                            : outcome && isAnswer
                              ? { opacity: 1, y: 0, scale: [1, 1.04, 1] }
                              : { opacity: 1, y: 0 }
                        }
                        transition={{ delay: outcome ? 0 : 0.05 * i, duration: outcome ? 0.4 : 0.3 }}
                        whileTap={outcome ? undefined : { scale: 0.97 }}
                      >
                        <span className="key">{i + 1}</span>
                        <span>{choice}</span>
                        {outcome && isAnswer && <IconCheck className="mark" />}
                        {outcome && isChosen && !isAnswer && <IconX className="mark" />}
                      </motion.button>
                    );
                  })}
                </div>
              )}
              {outcome && <div style={{ height: 250 }} aria-hidden="true" />}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {outcome && (
          <motion.div
            className={`sheet ${outcome.correct ? 'good' : 'bad'}`}
            role="status"
            aria-live="assertive"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          >
            <div className="sheet-inner">
              <h3>
                <motion.span initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 15, delay: 0.05 }} style={{ display: 'inline-flex' }}>
                  {outcome.correct ? <IconCheck /> : <IconX />}
                </motion.span>
                {title}
              </h3>
              <p className="answer-line">
                {item.en} <span className="muted">— {item.pt}</span>
              </p>
              {outcome.typo && <p className="muted" style={{ margin: 0 }}>Grafia certa: <strong style={{ color: 'var(--text)' }}>{item.en}</strong></p>}
              {!outcome.correct && <p className="muted" style={{ margin: 0 }}>Essa volta daqui a pouco para você fixar.</p>}
              {item.ex && (
                <div className="example">
                  <div style={{ flex: 1 }}>
                    <p className="en">{item.ex}</p>
                    <p className="pt">{item.exPt}</p>
                  </div>
                  <SpeakButton text={item.ex} size="small" />
                </div>
              )}
              <button type="button" className={`btn btn-block ${outcome.correct ? 'btn-good' : 'btn-bad'}`} onClick={advance} autoFocus>
                Continuar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Confetti burst={burst} amount={combo > 0 && combo % 5 === 0 ? 48 : 22} />
    </section>
  );
}
