import type { Pack } from '../data/types';
import type { SituationRecord } from './chat';
import { DAY, dayKey, isMastered, startOfDay, type CardState } from './srs';

export interface Settings {
  autoAudio: boolean;
  sounds: boolean;
  newPerDay: number;
  /** Meta diária de estudo, em minutos. */
  goalMinutes: number;
  /** Pacote de onde vêm as palavras novas (null = seguir a ordem). */
  focusPack: string | null;
  /** Horário do lembrete diário ("HH:MM"). */
  reminder: string;
}

export interface DayStats {
  answers: number;
  correct: number;
  newItems: number;
  /** Tempo de estudo no dia (ms). Ausente em dias antigos. */
  ms?: number;
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
  /** Histórias lidas: quantas vezes e melhor nota (acertos nas perguntas). */
  stories: Record<string, SituationRecord>;
  /** Treino de ouvido: rodadas de ditado e de shadowing concluídas. */
  ear: { dictation: number; shadowing: number };
  /** Tempo total de estudo (ms). */
  totalMs: number;
  /** Maior sequência de dias já alcançada. */
  bestStreak: number;
  /** Medalhas conquistadas: id → quando (ms). */
  medals: Record<string, number>;
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
    settings: { autoAudio: true, sounds: true, newPerDay: 12, goalMinutes: 10, focusPack: null, reminder: '20:00' },
    pauses: { audio: 0, mic: 0 },
    history: {},
    situations: {},
    stories: {},
    ear: { dictation: 0, shadowing: 0 },
    totalMs: 0,
    bestStreak: 0,
    medals: {},
  };
}

export function masteredRatio(pack: Pack, cards: Readonly<Record<string, CardState>>): number {
  if (pack.items.length === 0) return 1;
  const done = pack.items.filter((item) => isMastered(cards[item.id])).length;
  return done / pack.items.length;
}

/** Palavras vistas para liberar os pacotes temáticos. */
export const THEME_UNLOCK_SEEN = 60;

/**
 * Pacotes liberados: o primeiro principal sempre; cada principal seguinte quando o anterior
 * tem 80% dos itens dominados. Os temáticos liberam com 60 palavras vistas.
 */
export function unlockedPacks(packs: readonly Pack[], cards: Readonly<Record<string, CardState>>): Pack[] {
  const out: Pack[] = [];
  let open = true;
  for (const pack of packs.filter((p) => p.kind === 'core')) {
    if (!open) break;
    out.push(pack);
    open = masteredRatio(pack, cards) >= UNLOCK_RATIO;
  }
  if (Object.keys(cards).length >= THEME_UNLOCK_SEEN) out.push(...packs.filter((p) => p.kind === 'theme'));
  return out;
}

/** Itens novos na ordem certa: primeiro os do pacote em foco, depois o resto. */
export function orderByFocus<T extends { id: string }>(items: readonly T[], focusPack: string | null): T[] {
  if (!focusPack) return [...items];
  const prefix = `${focusPack}:`;
  return [...items.filter((i) => i.id.startsWith(prefix)), ...items.filter((i) => !i.id.startsWith(prefix))];
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
  const streak = currentStreak(progress, now) + 1;
  return { ...progress, streak, bestStreak: Math.max(progress.bestStreak, streak), lastStudyDay: today };
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

/** Soma tempo de estudo no total e no dia. */
export function addStudyTime(progress: Progress, now: number, ms: number): Progress {
  if (ms <= 0) return progress;
  const today = dayKey(now);
  const day = progress.history[today] ?? { answers: 0, correct: 0, newItems: 0 };
  return {
    ...progress,
    totalMs: progress.totalMs + ms,
    history: { ...progress.history, [today]: { ...day, ms: (day.ms ?? 0) + ms } },
  };
}

export function todayMs(progress: Progress, now: number): number {
  return progress.history[dayKey(now)]?.ms ?? 0;
}

/** Registra uma história lida (conta como dia de estudo). */
export function completeStory(progress: Progress, id: string, score: number, now: number): Progress {
  const prev = progress.stories[id] ?? { done: 0, best: 0 };
  const next = { ...progress, stories: { ...progress.stories, [id]: { done: prev.done + 1, best: Math.max(prev.best, score) } } };
  return registerStudyDay(next, now);
}

/** Registra uma rodada de ditado ou shadowing (conta como dia de estudo). */
export function completeEar(progress: Progress, kind: 'dictation' | 'shadowing', now: number): Progress {
  return registerStudyDay({ ...progress, ear: { ...progress.ear, [kind]: progress.ear[kind] + 1 } }, now);
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

/** Completa um progresso salvo (ou importado) com os campos que faltam. */
export function normalizeProgress(parsed: Partial<Progress>): Progress {
  const base = emptyProgress();
  return {
    ...base,
    ...parsed,
    version: 1,
    cards: { ...parsed.cards },
    settings: { ...base.settings, ...parsed.settings },
    pauses: { ...base.pauses, ...parsed.pauses },
    history: { ...parsed.history },
    situations: { ...parsed.situations },
    stories: { ...parsed.stories },
    ear: { ...base.ear, ...parsed.ear },
    totalMs: typeof parsed.totalMs === 'number' ? parsed.totalMs : 0,
    bestStreak: Math.max(parsed.bestStreak ?? 0, parsed.streak ?? 0),
    medals: { ...parsed.medals },
  };
}

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    return normalizeProgress(JSON.parse(raw) as Partial<Progress>);
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
