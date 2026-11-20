/**
 * Fase 1 — sistema Leitner (repetição espaçada simples).
 *
 * Cada item fica numa "caixa" de 0 a 6. Acertou: sobe uma caixa e só volta depois do
 * intervalo daquela caixa. Errou: desce uma caixa e volta logo.
 * A caixa também define o tipo de pergunta, do mais fácil para o mais difícil.
 */

export const DAY = 24 * 60 * 60 * 1000;

/** Dias até a próxima revisão ao chegar em cada caixa. */
export const INTERVAL_DAYS = [0, 1, 2, 4, 7, 15, 30] as const;
export const MAX_BOX = INTERVAL_DAYS.length - 1;
/** A partir desta caixa (intervalo de 7+ dias) o item conta como "dominado". */
export const MASTERED_BOX = 4;

export type Mode = 'en-pt-choice' | 'pt-en-choice' | 'pt-en-type';

export interface CardState {
  box: number;
  /** Momento (ms) em que o item volta a ficar pendente. */
  due: number;
  correct: number;
  wrong: number;
  lastSeen: number;
}

export function newCard(now: number): CardState {
  return { box: 0, due: now, correct: 0, wrong: 0, lastSeen: now };
}

export function modeForBox(box: number): Mode {
  if (box <= 1) return 'en-pt-choice';
  if (box <= 3) return 'pt-en-choice';
  return 'pt-en-type';
}

export function grade(card: CardState, isCorrect: boolean, now: number): CardState {
  if (isCorrect) {
    const box = Math.min(MAX_BOX, card.box + 1);
    return {
      box,
      // Conta a partir do início do dia: o que foi estudado à noite volta já de manhã.
      due: startOfDay(now) + (INTERVAL_DAYS[box] ?? 0) * DAY,
      correct: card.correct + 1,
      wrong: card.wrong,
      lastSeen: now,
    };
  }
  return {
    box: Math.max(0, card.box - 1),
    due: now,
    correct: card.correct,
    wrong: card.wrong + 1,
    lastSeen: now,
  };
}

export function startOfDay(now: number): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Chave do dia local, ex.: "2026-11-20". */
export function dayKey(now: number): string {
  const d = new Date(now);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function isDue(card: CardState, now: number): boolean {
  return card.due <= now;
}

export function isMastered(card: CardState | undefined): boolean {
  return card !== undefined && card.box >= MASTERED_BOX;
}
