/** Normaliza uma resposta digitada: minúsculas, sem acento, sem pontuação nem apóstrofo. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’'`´]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0] ?? 0;
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const up = prev[j] ?? 0;
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      prev[j] = Math.min(up + 1, (prev[j - 1] ?? 0) + 1, diag + cost);
      diag = up;
    }
  }
  return prev[b.length] ?? 0;
}

export type TypedResult = 'exact' | 'typo' | 'wrong';

/**
 * Confere a resposta digitada. Um erro de digitação (1 letra) em palavras de 5+ letras
 * conta como acerto, mas o app mostra a grafia certa.
 */
export function checkTyped(input: string, expected: string): TypedResult {
  const a = normalize(input);
  const b = normalize(expected);
  if (a.length === 0) return 'wrong';
  if (a === b) return 'exact';
  if (b.length >= 5 && levenshtein(a, b) <= 1) return 'typo';
  return 'wrong';
}
