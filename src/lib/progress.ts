import type { Pack } from '../data/types';
import { DAY, dayKey, isMastered, startOfDay, type CardState } from './srs';

export interface Settings {
  autoAudio: boolean;
  newPerDay: number;
}

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
    settings: { autoAudio: true, newPerDay: 12 },
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
  return { ...progress, newToday: { day: today, count: base + count } };
}

// Chave antiga (nome provisório "Loop"): não mudar, senão o progresso salvo se perde.
const STORAGE_KEY = 'loop-english:v1';

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw) as Partial<Progress>;
    const base = emptyProgress();
    return { ...base, ...parsed, settings: { ...base.settings, ...parsed.settings } };
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
