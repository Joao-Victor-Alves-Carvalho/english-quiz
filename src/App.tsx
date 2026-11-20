import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { packs } from './data/packs';
import { situations } from './data/situations';
import { Aurora, type Mood } from './components/Aurora';
import {
  currentStreak,
  loadProgress,
  newAllowedToday,
  pausedMinutes,
  registerStudyDay,
  completeSituation,
  resume,
  saveProgress,
  unlockedPacks,
  type Progress,
} from './lib/progress';
import { buildSession, DEFAULT_SESSION, dueItems, shuffle, unseenItems, type Step } from './lib/session';
import { modeFor } from './lib/modes';
import { Home } from './screens/Home';
import { Result } from './screens/Result';
import { Session, type Summary } from './screens/Session';
import { Words } from './screens/Words';
import { Chat } from './screens/Chat';
import { Situations } from './screens/Situations';

type Screen = { name: 'home' } | { name: 'session'; steps: Step[]; key: number } | { name: 'result'; summary: Summary } | { name: 'words' }
  | { name: 'situations' }
  | { name: 'chat'; id: string; key: number };

export function App() {
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [mood, setMood] = useState<Mood>('idle');

  useEffect(() => saveProgress(progress), [progress]);

  const updateProgress = useCallback((fn: (p: Progress) => Progress) => setProgress(fn), []);

  // Recalcula a cada volta para a tela inicial (o "agora" muda).
  const plan = useMemo(() => {
    const now = Date.now();
    const unlocked = unlockedPacks(packs, progress.cards);
    const pool = unlocked.flatMap((p) => p.items);
    const due = dueItems(pool, progress.cards, now);
    const unseen = unseenItems(pool, progress.cards);
    const newCount = Math.min(newAllowedToday(progress, now), unseen.length);
    return { unlocked, pool, due, unseen, newCount };
  }, [progress, screen.name]);

  const seenWords = Object.keys(progress.cards).length;
  const chatSituation = screen.name === 'chat' ? situations.find((s) => s.id === screen.id) : undefined;

  const start = () => {
    const fresh = plan.unseen.slice(0, Math.min(plan.newCount, DEFAULT_SESSION.maxNew));
    const steps = buildSession(plan.due, fresh, progress.cards, Math.random);
    setScreen({ name: 'session', steps, key: Date.now() });
  };

  const startExtra = () => {
    const seen = plan.pool.filter((item) => progress.cards[item.id]);
    const weakest = seen
      .sort((a, b) => (progress.cards[a.id]?.box ?? 0) - (progress.cards[b.id]?.box ?? 0))
      .slice(0, 12);
    const steps = shuffle(weakest, Math.random).map<Step>((item, slot) => ({
      itemId: item.id,
      kind: 'quiz',
      graded: false,
      mode: modeFor(progress.cards[item.id]?.box ?? 0, slot, item),
    }));
    setScreen({ name: 'session', steps, key: Date.now() });
  };

  const finish = (summary: Summary) => {
    setProgress((p) => ({ ...registerStudyDay(p, Date.now()), bestCombo: Math.max(p.bestCombo, summary.bestCombo) }));
    setScreen({ name: 'result', summary });
  };

  const goHome = () => {
    setMood('idle');
    setScreen({ name: 'home' });
  };

  return (
    <>
      <Aurora mood={mood} />
      <main className="app">
        <AnimatePresence mode="wait">
          <motion.div
            key={screen.name === 'session' ? `session-${screen.key}` : screen.name === 'chat' ? `chat-${screen.key}` : screen.name}
            className="screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {screen.name === 'home' && (
              <Home
                progress={progress}
                dueCount={plan.due.length}
                newCount={plan.newCount}
                unlockedCount={plan.unlocked.length}
                onStart={start}
                onExtra={startExtra}
                onWords={() => setScreen({ name: 'words' })}
                onSituations={() => setScreen({ name: 'situations' })}
                seenWords={seenWords}
                onToggleAudio={() =>
                  setProgress((p) => ({ ...p, settings: { ...p.settings, autoAudio: !p.settings.autoAudio } }))
                }
                onToggleSounds={() => setProgress((p) => ({ ...p, settings: { ...p.settings, sounds: !p.settings.sounds } }))}
                onResume={(kind) => setProgress((p) => resume(p, kind))}
              />
            )}
            {screen.name === 'session' && (
              <Session
                steps={screen.steps}
                pool={plan.pool}
                progress={progress}
                updateProgress={updateProgress}
                setMood={setMood}
                onFinish={finish}
                onExit={goHome}
              />
            )}
            {screen.name === 'result' && (
              <Result
                summary={screen.summary}
                streak={currentStreak(progress, Date.now())}
                sound={progress.settings.sounds && pausedMinutes(progress, 'audio', Date.now()) === 0}
                onDone={goHome}
              />
            )}
            {screen.name === 'words' && <Words items={plan.pool} progress={progress} onBack={goHome} />}
            {screen.name === 'situations' && (
              <Situations
                progress={progress}
                seenWords={seenWords}
                onOpen={(id) => setScreen({ name: 'chat', id, key: Date.now() })}
                onBack={goHome}
              />
            )}
            {screen.name === 'chat' && chatSituation && (
              <Chat
                situation={chatSituation}
                progress={progress}
                updateProgress={updateProgress}
                onComplete={(stars) => setProgress((p) => completeSituation(p, chatSituation.id, stars, Date.now()))}
                onBack={() => setScreen({ name: 'situations' })}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </>
  );
}
