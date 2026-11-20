/**
 * Agendamento das revisões.
 *
 * - A "caixa" (0 a 6) mede o quanto a palavra já foi praticada e define o TIPO de pergunta
 *   (reconhecer → escolher em inglês → digitar/falar). Acertou sobe, errou desce.
 * - O QUANDO revisar vem do FSRS (Free Spaced Repetition Scheduler, o algoritmo do Anki):
 *   ele estima a memória de cada palavra (estabilidade e dificuldade) e marca a revisão para
 *   quando a chance de lembrar cair para ~90%. A nota da resposta (difícil, bom, fácil)
 *   ajusta essa estimativa.
 * - Errou: a palavra fica pendente na hora (volta na próxima sessão), e o FSRS registra o lapso.
 */
import { createEmptyCard, fsrs, generatorParameters, Rating, State, type Card, type Grade } from 'ts-fsrs';

export const DAY = 24 * 60 * 60 * 1000;

/** Intervalos do sistema antigo (Leitner): usados só para migrar o progresso salvo. */
export const INTERVAL_DAYS = [0, 1, 2, 4, 7, 15, 30] as const;
export const MAX_BOX = INTERVAL_DAYS.length - 1;
/** A partir desta caixa o item conta como "dominado". */
export const MASTERED_BOX = 4;

export type Rate = 'again' | 'hard' | 'good' | 'easy';

/** Memória do FSRS, guardada de forma compacta junto com o progresso. */
export interface Memory {
  /** Estabilidade (dias até a chance de lembrar cair para 90%). */
  s: number;
  /** Dificuldade (1 a 10). */
  d: number;
  reps: number;
  lapses: number;
  /** Última revisão (ms). */
  last: number;
}

export interface CardState {
  box: number;
  /** Momento (ms) em que o item volta a ficar pendente. */
  due: number;
  correct: number;
  wrong: number;
  lastSeen: number;
  mem?: Memory;
  /** Último erro (ms), para o caderno de erros. Some quando o erro é corrigido. */
  lastWrong?: number;
}

const scheduler = fsrs(generatorParameters({ enable_fuzz: false, enable_short_term: false, maximum_interval: 365 }));

const RATING: Record<Rate, Grade> = {
  again: Rating.Again,
  hard: Rating.Hard,
  good: Rating.Good,
  easy: Rating.Easy,
};

export function newCard(now: number): CardState {
  return { box: 0, due: now, correct: 0, wrong: 0, lastSeen: now };
}

/** Converte o estado salvo para o formato do FSRS (migrando cartões do sistema antigo). */
function toFsrs(card: CardState, now: number): Card {
  if (card.mem) {
    const last = new Date(card.mem.last);
    return {
      ...createEmptyCard(last),
      due: new Date(card.due),
      stability: card.mem.s,
      difficulty: card.mem.d,
      reps: card.mem.reps,
      lapses: card.mem.lapses,
      state: State.Review,
      last_review: last,
      elapsed_days: 0,
      scheduled_days: Math.max(0, Math.round((card.due - card.mem.last) / DAY)),
    };
  }
  if (card.correct + card.wrong === 0) return createEmptyCard(new Date(now));
  // Cartão do sistema antigo: estima a memória pelo intervalo da caixa.
  const s = Math.max(0.5, INTERVAL_DAYS[card.box] ?? 0.5);
  return {
    ...createEmptyCard(new Date(card.lastSeen)),
    due: new Date(card.due),
    stability: s,
    difficulty: 5,
    reps: card.correct + card.wrong,
    lapses: card.wrong,
    state: State.Review,
    last_review: new Date(card.lastSeen),
    elapsed_days: 0,
    scheduled_days: Math.round(s),
  };
}

/** Nota automática quando a pessoa não escolhe: errou → again; com erro de digitação → hard. */
export function autoRate(correct: boolean, typo = false): Rate {
  if (!correct) return 'again';
  return typo ? 'hard' : 'good';
}

export function grade(card: CardState, rate: Rate | boolean, now: number): CardState {
  const r: Rate = typeof rate === 'boolean' ? autoRate(rate) : rate;
  const next = scheduler.next(toFsrs(card, now), new Date(now), RATING[r]).card;
  const mem: Memory = { s: next.stability, d: next.difficulty, reps: next.reps, lapses: next.lapses, last: now };

  if (r === 'again') {
    return {
      ...card,
      box: Math.max(0, card.box - 1),
      due: now,
      wrong: card.wrong + 1,
      lastSeen: now,
      lastWrong: now,
      mem,
    };
  }
  // Conta a partir do início do dia: o que foi estudado à noite volta de manhã.
  const due = Math.max(startOfDay(next.due.getTime()), startOfDay(now) + DAY);
  return {
    ...card,
    box: Math.min(MAX_BOX, card.box + 1),
    due,
    correct: card.correct + 1,
    lastSeen: now,
    mem,
  };
}

/** Dias até a próxima revisão para cada nota (para mostrar nos botões). */
export function previewDays(card: CardState, now: number): Record<Exclude<Rate, 'again'>, number> {
  const out = { hard: 0, good: 0, easy: 0 };
  for (const r of ['hard', 'good', 'easy'] as const) {
    out[r] = Math.round((grade(card, r, now).due - startOfDay(now)) / DAY);
  }
  return out;
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
