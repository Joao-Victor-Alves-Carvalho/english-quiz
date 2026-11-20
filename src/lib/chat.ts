import { normalize } from './answer';

/**
 * Situações reais em formato de conversa (estilo WhatsApp).
 * O roteiro alterna falas da outra pessoa ("them") e turnos seus:
 * - choose: escolher a resposta adequada entre opções;
 * - build: montar a frase tocando nas palavras na ordem certa.
 */
export interface ChatOption {
  text: string;
  pt: string;
  ok: boolean;
  /** Por que a opção não serve (obrigatório nas erradas). */
  why?: string;
}

export type ChatStep =
  | { kind: 'them'; text: string; pt: string }
  | { kind: 'choose'; goal: string; options: ChatOption[] }
  | { kind: 'build'; goal: string; text: string; pt: string; extra: string[] };

export interface Situation {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  partner: { name: string; role: string };
  /** Quantas palavras vistas para liberar (0 = desde o início). */
  unlockAt: number;
  steps: ChatStep[];
}

export interface SituationRecord {
  done: number;
  best: number;
}

/** Palavras de uma frase para montar: sem pontuação, mantendo apóstrofos (I'm, I'd). */
export function tokens(text: string): string[] {
  return text
    .split(/\s+/)
    .map((t) => t.replace(/[.,!?;:]/g, ''))
    .filter(Boolean);
}

export function checkBuild(picked: readonly string[], target: string): boolean {
  return normalize(picked.join(' ')) === normalize(target);
}

export function isUnlocked(situation: Situation, seenWords: number): boolean {
  return seenWords >= situation.unlockAt;
}

/** Turnos em que você responde. */
export function myTurns(situation: Situation): number {
  return situation.steps.filter((s) => s.kind !== 'them').length;
}

/** Estrelas: 3 sem erros, 2 com até 2 turnos errados, 1 no resto. */
export function stars(missedTurns: number): 1 | 2 | 3 {
  if (missedTurns === 0) return 3;
  if (missedTurns <= 2) return 2;
  return 1;
}

/** Frases úteis da conversa (as respostas certas), para revisar no fim. */
export function phrasesOf(situation: Situation): { text: string; pt: string }[] {
  const out: { text: string; pt: string }[] = [];
  for (const step of situation.steps) {
    if (step.kind === 'build') out.push({ text: step.text, pt: step.pt });
    if (step.kind === 'choose') {
      const best = step.options.find((o) => o.ok);
      if (best) out.push({ text: best.text, pt: best.pt });
    }
  }
  return out;
}

/** Explicação quando a frase montada não está certa. */
export function explainBuild(picked: readonly string[], step: Extract<ChatStep, { kind: 'build' }>): string {
  const extras = picked.filter((w) => step.extra.includes(w) && !tokens(step.text).includes(w));
  const parts = [`A frase certa é "${step.text}" (${step.pt}).`];
  if (extras.length > 0) parts.push(`"${extras.join('", "')}" não entra nessa frase.`);
  else if (picked.length < tokens(step.text).length) parts.push('Faltou palavra: use todas as palavras da frase certa.');
  else parts.push('As palavras estão certas, mas a ordem não. Compare com a frase acima e monte de novo.');
  return parts.join(' ');
}
