/**
 * "Tempo de Miller": no filme, 1 hora no planeta de Miller equivale a 7 anos na Terra.
 */
export const EARTH_YEAR_HOURS = 365.25 * 24;
/** Quantas horas passam na Terra para cada hora em Miller. */
export const MILLER_RATIO = 7 * EARTH_YEAR_HOURS; // 61.362

const nf = (value: number, digits = 2) =>
  value.toLocaleString('pt-BR', { maximumSignificantDigits: digits, minimumSignificantDigits: 1 });

/** Tempo que passou em Miller enquanto você estudou `earthMs` aqui na Terra (em segundos). */
export function millerSeconds(earthMs: number): number {
  return earthMs / 1000 / MILLER_RATIO;
}

/** Tempo que passaria na Terra se você estudasse `ms` lá em Miller (em anos). */
export function earthYearsIfOnMiller(ms: number): number {
  return (ms / 3_600_000) * 7;
}

/** Duração de estudo: "45 s", "12 min", "1 h 05 min". */
export function formatStudy(ms: number): string {
  const totalSec = Math.round(ms / 1000);
  if (totalSec < 60) return `${totalSec} s`;
  const totalMin = Math.round(totalSec / 60);
  if (totalMin < 60) return `${totalMin} min`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h} h ${String(m).padStart(2, '0')} min`;
}

/** Tempo minúsculo em Miller: "0,0098 segundo", "1,2 segundo", "3,5 minutos". */
export function formatMiller(seconds: number): string {
  if (seconds <= 0) return '0 segundos';
  if (seconds < 1) return `${nf(seconds)} segundo`;
  if (seconds < 60) return `${nf(seconds)} ${seconds < 2 ? 'segundo' : 'segundos'}`;
  const min = seconds / 60;
  return `${nf(min)} ${min < 2 ? 'minuto' : 'minutos'}`;
}

/** Tempo na Terra: "18 dias", "4,2 meses", "1,4 ano", "12 anos". */
export function formatEarth(years: number): string {
  if (years <= 0) return '0 dias';
  const days = years * 365.25;
  if (days < 30) {
    const d = Math.max(1, Math.round(days));
    return `${d} ${d === 1 ? 'dia' : 'dias'}`;
  }
  if (years < 1) {
    const months = years * 12;
    return `${nf(months)} ${months < 2 ? 'mês' : 'meses'}`;
  }
  return `${nf(years, years < 10 ? 2 : 3)} ${years < 2 ? 'ano' : 'anos'}`;
}

/** Pausa máxima contada entre duas interações (evita contar o app parado aberto). */
export const MAX_GAP_MS = 90_000;

/** Relógio de estudo: soma o tempo entre interações, ignorando pausas longas. */
export function tick(last: number | null, now: number): { add: number; last: number } {
  if (last === null) return { add: 0, last: now };
  const gap = now - last;
  return { add: gap > 0 && gap <= MAX_GAP_MS ? gap : 0, last: now };
}
