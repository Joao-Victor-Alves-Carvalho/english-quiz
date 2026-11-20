import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Story } from '../data/stories';
import { Confetti } from '../components/Confetti';
import { IconArrowLeft, IconCheck, IconSpeaker, IconX } from '../components/Icons';
import { pausedMinutes, type Progress } from '../lib/progress';
import { shuffle } from '../lib/session';
import { playComplete, playCorrect, playWrong } from '../lib/sfx';
import { canSpeak, speak, speakSequence, stopSpeaking, vibrate } from '../lib/speech';

export function StoryReader({ story, progress, onComplete, onBack }: { story: Story; progress: Progress; onComplete: (score: number) => void; onBack: () => void }) {
  const [phase, setPhase] = useState<'read' | 'quiz' | 'done'>('read');
  const [reading, setReading] = useState(-1);
  const [showAll, setShowAll] = useState(false);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [q, setQ] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const saved = useRef(false);

  const audioOn = canSpeak() && pausedMinutes(progress, 'audio', Date.now()) === 0;
  const soundsOn = progress.settings.sounds && pausedMinutes(progress, 'audio', Date.now()) === 0;
  const question = story.questions[q];
  const options = useMemo(() => (question ? shuffle(question.options, Math.random) : []), [q]);

  useEffect(() => () => stopSpeaking(), []);

  const toggle = (i: number) =>
    setRevealed((r) => {
      const next = new Set(r);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const choose = (text: string, ok: boolean) => {
    if (picked) return;
    setPicked(text);
    if (ok) {
      setScore((s) => s + 1);
      vibrate(20);
      if (soundsOn) playCorrect();
    } else {
      vibrate([70, 50, 70]);
      if (soundsOn) playWrong();
    }
  };

  const next = () => {
    setPicked(null);
    if (q + 1 < story.questions.length) {
      setQ(q + 1);
      return;
    }
    setPhase('done');
    if (!saved.current) {
      saved.current = true;
      if (soundsOn) playComplete();
      onComplete(score);
    }
  };

  return (
    <section className="screen" aria-label={`História: ${story.title}`}>
      <div className="topbar">
        <button
          type="button"
          className="icon-btn"
          onClick={() => {
            stopSpeaking();
            onBack();
          }}
          aria-label="Voltar"
        >
          <IconArrowLeft />
        </button>
        <h1 className="page-title" style={{ fontSize: 22 }}>
          {story.emoji} {story.title}
        </h1>
      </div>

      {phase === 'read' && (
        <>
          <div className="row" style={{ flexWrap: 'wrap' }}>
            {audioOn && (
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() =>
                  reading >= 0
                    ? (stopSpeaking(), setReading(-1))
                    : speakSequence(
                        story.sentences.map((s) => s.en),
                        setReading,
                        0.85,
                      )
                }
              >
                <IconSpeaker width={20} height={20} /> {reading >= 0 ? 'Parar' : 'Ouvir a história'}
              </button>
            )}
            <button type="button" className="btn btn-ghost switch" role="switch" aria-checked={showAll} onClick={() => setShowAll(!showAll)}>
              Tradução <span className="track" aria-hidden="true" />
            </button>
          </div>
          <ol className="story">
            {story.sentences.map((s, i) => (
              <motion.li key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <button type="button" className={`story-line${reading === i ? ' reading' : ''}`} onClick={() => toggle(i)} aria-expanded={showAll || revealed.has(i)}>
                  <span className="en">{s.en}</span>
                  {(showAll || revealed.has(i)) && <span className="pt">{s.pt}</span>}
                </button>
                {audioOn && (
                  <button type="button" className="bubble-audio" onClick={() => speak(s.en, 0.85)} aria-label={`Ouvir: ${s.en}`}>
                    <IconSpeaker />
                  </button>
                )}
              </motion.li>
            ))}
          </ol>
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => {
              stopSpeaking();
              setReading(-1);
              setPhase('quiz');
            }}
          >
            Responder as perguntas
          </button>
        </>
      )}

      {phase === 'quiz' && question && (
        <AnimatePresence mode="wait">
          <motion.div key={q} className="stage" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <p className="eyebrow">
              Pergunta {q + 1} de {story.questions.length}
            </p>
            <h2 className="question-title">{question.q}</h2>
            <div className="options">
              {options.map((o) => {
                let cls = 'option';
                if (picked) cls += o.ok ? ' is-correct' : picked === o.text ? ' is-wrong' : ' is-dim';
                return (
                  <motion.button
                    key={o.text}
                    type="button"
                    className={cls}
                    disabled={picked !== null}
                    onClick={() => choose(o.text, o.ok)}
                    animate={picked === o.text && !o.ok ? { x: [0, -12, 12, -8, 8, 0] } : { x: 0 }}
                  >
                    <span>{o.text}</span>
                    {picked && o.ok && <IconCheck className="mark" />}
                    {picked === o.text && !o.ok && <IconX className="mark" />}
                  </motion.button>
                );
              })}
            </div>
            {picked && (
              <motion.div className="tip" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                💡 {question.why}
              </motion.div>
            )}
            {picked && (
              <button type="button" className="btn btn-primary btn-block" onClick={next} autoFocus>
                {q + 1 < story.questions.length ? 'Próxima' : 'Ver resultado'}
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {phase === 'done' && (
        <motion.div className="chat-done glass" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <p className="stars" aria-label={`${score} de ${story.questions.length} acertos`}>
            {story.questions.map((_, n) => (
              <span key={n} className={n < score ? 'on' : ''}>
                ★
              </span>
            ))}
          </p>
          <h2>{score === story.questions.length ? 'Entendeu tudo!' : 'História concluída!'}</h2>
          <p className="muted" style={{ margin: 0 }}>
            Você acertou {score} de {story.questions.length} perguntas. Ler e ouvir histórias com palavras conhecidas é o "input compreensível": o jeito mais natural de fixar o inglês.
          </p>
          <div className="row" style={{ marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onBack}>
              Voltar
            </button>
            <button
              type="button"
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={() => {
                saved.current = false;
                setScore(0);
                setQ(0);
                setPhase('read');
              }}
            >
              Ler de novo
            </button>
          </div>
        </motion.div>
      )}
      <Confetti burst={phase === 'done' && score > 0 ? 1 : 0} amount={40} />
    </section>
  );
}
