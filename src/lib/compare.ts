import { normalizeSpoken } from './answer';
import { levenshtein } from './answer';

export interface WordCheck {
  word: string;
  ok: boolean;
}

/**
 * Compara palavra por palavra (ditado e shadowing), tolerando pontuação, maiúsculas,
 * números em dígitos e pequenos erros de digitação/reconhecimento.
 * Usa alinhamento (LCS) para não punir tudo depois de uma palavra faltando.
 */
export function compareWords(expected: string, got: string): { words: WordCheck[]; score: number } {
  const exp = expected.split(/\s+/).filter(Boolean);
  const expNorm = exp.map((w) => normalizeSpoken(w));
  const gotNorm = normalizeSpoken(got).split(' ').filter(Boolean);
  const same = (a: string, b: string) => a === b || (a.length >= 5 && levenshtein(a, b) <= 1);

  // LCS entre as palavras esperadas e as recebidas.
  const n = expNorm.length;
  const m = gotNorm.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      const row = dp[i] as number[];
      const below = dp[i + 1] as number[];
      row[j] = same(expNorm[i] ?? '', gotNorm[j] ?? '') ? (below[j + 1] ?? 0) + 1 : Math.max(below[j] ?? 0, row[j + 1] ?? 0);
    }
  }
  const okIdx = new Set<number>();
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (same(expNorm[i] ?? '', gotNorm[j] ?? '')) {
      okIdx.add(i);
      i++;
      j++;
    } else if ((dp[i + 1]?.[j] ?? 0) >= (dp[i]?.[j + 1] ?? 0)) i++;
    else j++;
  }
  const words = exp.map((word, k) => ({ word, ok: expNorm[k] === '' || okIdx.has(k) }));
  const counted = words.filter((_, k) => expNorm[k] !== '');
  const score = counted.length === 0 ? 1 : counted.filter((w) => w.ok).length / counted.length;
  return { words, score };
}
