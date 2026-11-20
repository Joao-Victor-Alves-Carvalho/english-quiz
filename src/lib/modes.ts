import type { Item } from '../data/types';

/**
 * Tipos de pergunta.
 * - en-pt-choice: vê a palavra em inglês e escolhe o significado.
 * - pt-en-choice: vê em português e escolhe o inglês.
 * - pt-en-type: vê em português e digita o inglês.
 * - listen-choice: só ouve o inglês e escolhe o significado (precisa de áudio).
 * - cloze-choice: completa a lacuna de uma frase (como no Duolingo).
 * - speak: vê em português e fala o inglês no microfone (precisa de microfone).
 */
export type Mode = 'en-pt-choice' | 'pt-en-choice' | 'pt-en-type' | 'listen-choice' | 'cloze-choice' | 'speak';

export interface Caps {
  audio: boolean;
  mic: boolean;
}

export interface ClozeParts {
  before: string;
  answer: string;
  after: string;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Separa a frase de exemplo em antes / palavra / depois. Null se a palavra não aparece igual na frase. */
export function clozeParts(item: Item): ClozeParts | null {
  if (!item.ex || item.pos === 'frase') return null;
  const re = new RegExp(`(^|[^A-Za-z'])(${escapeRegExp(item.en)})(?=$|[^A-Za-z'])`, 'i');
  const match = re.exec(item.ex);
  if (!match || match[2] === undefined) return null;
  const start = match.index + (match[1]?.length ?? 0);
  const before = item.ex.slice(0, start);
  const after = item.ex.slice(start + match[2].length);
  // Precisa sobrar contexto de verdade em volta da lacuna.
  if (before.replace(/[^A-Za-z]/g, '').length + after.replace(/[^A-Za-z]/g, '').length < 4) return null;
  return { before, answer: match[2], after };
}

/** Tipo de pergunta base por caixa, alternando pelo "slot" da sessão (intercalação). */
export function modeFor(box: number, slot: number, item: Item): Mode {
  let mode: Mode;
  if (box <= 1) mode = slot % 3 === 2 ? 'listen-choice' : 'en-pt-choice';
  else if (box <= 3) mode = (['pt-en-choice', 'cloze-choice', 'listen-choice', 'speak'] as const)[slot % 4] ?? 'pt-en-choice';
  else mode = (['pt-en-type', 'cloze-choice', 'speak', 'pt-en-type'] as const)[slot % 4] ?? 'pt-en-type';
  if (mode === 'cloze-choice' && !clozeParts(item)) return box <= 3 ? 'pt-en-choice' : 'pt-en-type';
  return mode;
}

export function needs(mode: Mode): 'audio' | 'mic' | null {
  if (mode === 'listen-choice') return 'audio';
  if (mode === 'speak') return 'mic';
  return null;
}

/** Troca perguntas que precisam de áudio/microfone quando eles estão indisponíveis ou pausados. */
export function resolveMode(mode: Mode, item: Item, caps: Caps): Mode {
  if (mode === 'listen-choice' && !caps.audio) return 'en-pt-choice';
  if (mode === 'speak' && !caps.mic) return 'pt-en-choice';
  if (mode === 'cloze-choice' && !clozeParts(item)) return 'pt-en-choice';
  return mode;
}

/** Campo das alternativas: significado em português ou palavra em inglês. */
export function answerField(mode: Mode): 'pt' | 'en' {
  return mode === 'en-pt-choice' || mode === 'listen-choice' ? 'pt' : 'en';
}

export function isChoice(mode: Mode): boolean {
  return mode !== 'pt-en-type' && mode !== 'speak';
}
