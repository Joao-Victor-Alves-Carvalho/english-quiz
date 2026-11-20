import type { Pack } from '../data/types';
import type { SituationRecord } from './chat';
import { DAY, dayKey, isMastered, startOfDay, type CardState } from './srs';

export interface Settings {
  autoAudio: boolean;
  sounds: boolean;
  newPerDay: number;
}

export interface DayStats {
  answers: number;
  correct: number;
  newItems: number;
}

export type PauseKind = 'audio' | 'mic';
export const PAUSE_MINUTES = 15;

export interface Progress {
  version: 1;
  cards: Record<string, CardState>;
  streak: number;
  /** Último dia (chave local) com sessão concluída. */
  lastStudyDay: string | null;
  newToday: { day: string; count: number };
  totalAnswers: number;
  totalCorrect: number;
  bestCombo: number;
  settings: Settings;
  /** Até quando (ms) perguntas de áudio / microfone ficam escondidas. */
  pauses: Record<PauseKind, number>;
  /** Histórico por dia (chave "AAAA-MM-DD"). */
  history: Record<string, DayStats>;
  /** Situações concluídas: quantas vezes e melhor número de estrelas. */
  situations: Record<string, SituationRecord>;
}

export const UNLOCK_RATIO = 0.8;

export function emptyProgress(): Progress {
  return {
    version: 1,
    cards: {},
    streak: 0,
    lastStudyDay: null,
    newToday: { day: '', count: 0 },
    totalAnswers: 0,
    totalCorrect: 0,
    bestCombo: 0,
    settings: { autoAudio: true, sounds: true, newPerDay: 12 },
    pauses: { audio: 0, mic: 0 },
    history: {},
    situations: {},
  };
}

export function masteredRatio(pack: Pack, cards: Readonly<Record<string, CardState>>): number {
  if (pack.items.length === 0) return 1;
  const done = pack.items.filter((item) => isMastered(cards[item.id])).length;
  return done / pack.items.length;
}

/**
 * Pacotes liberados: o primeiro sempre; cada próximo quando o anterior
 * tem 80% dos itens dominados (intervalo de 7+ dias).
 */
export function unlockedPacks(packs: readonly Pack[], cards: Readonly<Record<string, CardState>>): Pack[] {
  const out: Pack[] = [];
  for (const pack of packs) {
    out.push(pack);
    if (masteredRatio(pack, cards) < UNLOCK_RATIO) break;
  }
  return out;
}

export function newAllowedToday(progress: Progress, now: number): number {
  const today = dayKey(now);
  const used = progress.newToday.day === today ? progress.newToday.count : 0;
  return Math.max(0, progress.settings.newPerDay - used);
}

/** Sequência de dias: mantém se estudou ontem, zera se pulou um dia. */
export function currentStreak(progress: Progress, now: number): number {
  if (!progress.lastStudyDay) return 0;
  const today = dayKey(now);
  const yesterday = dayKey(startOfDay(now) - DAY / 2);
  return progress.lastStudyDay === today || progress.lastStudyDay === yesterday ? progress.streak : 0;
}

export function registerStudyDay(progress: Progress, now: number): Progress {
  const today = dayKey(now);
  if (progress.lastStudyDay === today) return progress;
  return { ...progress, streak: currentStreak(progress, now) + 1, lastStudyDay: today };
}

export function registerNewItems(progress: Progress, now: number, count: number): Progress {
  const today = dayKey(now);
  const base = progress.newToday.day === today ? progress.newToday.count : 0;
  const day = progress.history[today] ?? { answers: 0, correct: 0, newItems: 0 };
  return {
    ...progress,
    newToday: { day: today, count: base + count },
    history: { ...progress.history, [today]: { ...day, newItems: day.newItems + count } },
  };
}

/** Soma a resposta no total e no histórico do dia. */
export function recordAnswer(progress: Progress, now: number, correct: boolean): Progress {
  const today = dayKey(now);
  const day = progress.history[today] ?? { answers: 0, correct: 0, newItems: 0 };
  return {
    ...progress,
    totalAnswers: progress.totalAnswers + 1,
    totalCorrect: progress.totalCorrect + (correct ? 1 : 0),
    history: { ...progress.history, [today]: { ...day, answers: day.answers + 1, correct: day.correct + (correct ? 1 : 0) } },
  };
}

/** Registra uma situação concluída (conta como dia de estudo). */
export function completeSituation(progress: Progress, id: string, stars: number, now: number): Progress {
  const prev = progress.situations[id] ?? { done: 0, best: 0 };
  const next = { ...progress, situations: { ...progress.situations, [id]: { done: prev.done + 1, best: Math.max(prev.best, stars) } } };
  return registerStudyDay(next, now);
}

/** Esconde perguntas de áudio ou microfone por 15 minutos. */
export function pause(progress: Progress, kind: PauseKind, now: number): Progress {
  return { ...progress, pauses: { ...progress.pauses, [kind]: now + PAUSE_MINUTES * 60_000 } };
}

export function resume(progress: Progress, kind: PauseKind): Progress {
  return { ...progress, pauses: { ...progress.pauses, [kind]: 0 } };
}

/** Minutos restantes de pausa (0 = ativo). */
export function pausedMinutes(progress: Progress, kind: PauseKind, now: number): number {
  const until = progress.pauses[kind];
  return until > now ? Math.ceil((until - now) / 60_000) : 0;
}

export function capabilities(
  progress: Progress,
  now: number,
  support: { speech: boolean; recognition: boolean },
): { audio: boolean; mic: boolean } {
  return {
    audio: support.speech && pausedMinutes(progress, 'audio', now) === 0,
    mic: support.recognition && pausedMinutes(progress, 'mic', now) === 0,
  };
}

// Chave antiga (nome provisório "Loop"): não mudar, senão o progresso salvo se perde.
const STORAGE_KEY = 'loop-english:v1';

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw) as Partial<Progress>;
    const base = emptyProgress();
    return {
      ...base,
      ...parsed,
      settings: { ...base.settings, ...parsed.settings },
      pauses: { ...base.pauses, ...parsed.pauses },
      history: { ...parsed.history },
      situations: { ...parsed.situations },
    };
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(progress: Progress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Sem armazenamento (aba anônima, por exemplo): o app segue funcionando nesta sessão.
  }
}
