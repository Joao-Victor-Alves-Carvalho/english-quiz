import type { Item } from '../data/types';
import { shuffle, type Rng } from './session';

/**
 * Monta 4 alternativas: a certa + 3 erradas, de preferência da mesma classe
 * (verbo com verbo, frase com frase) para a pergunta não ficar óbvia.
 */
export function buildChoices(
  target: Item,
  pool: readonly Item[],
  rng: Rng,
  field: 'en' | 'pt',
  count = 4,
): string[] {
  const answer = target[field];
  const used = new Set([answer]);
  const take = (list: readonly Item[]): string[] => {
    const picked: string[] = [];
    for (const item of shuffle(list, rng)) {
      if (used.size >= count) break;
      const value = item[field];
      if (used.has(value)) continue;
      used.add(value);
      picked.push(value);
    }
    return picked;
  };
  const sameKind = take(pool.filter((i) => i.id !== target.id && i.pos === target.pos));
  const others = take(pool.filter((i) => i.id !== target.id && i.pos !== target.pos));
  return shuffle([answer, ...sameKind, ...others], rng);
}
