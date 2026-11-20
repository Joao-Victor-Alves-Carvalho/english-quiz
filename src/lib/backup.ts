import { normalizeProgress, type Progress } from './progress';

/**
 * Backup do progresso: um código de texto (para copiar e colar) ou um arquivo .json.
 * Formato do código: "MM1." + JSON em base64url. Não sai do aparelho sem você copiar.
 */
const PREFIX = 'MM1.';

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(code: string): string {
  const b64 = code.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function backupJson(progress: Progress): string {
  return JSON.stringify({ app: 'miller-minute', exportedAt: new Date().toISOString(), progress });
}

export function encodeBackup(progress: Progress): string {
  return PREFIX + toBase64Url(JSON.stringify(progress));
}

export type DecodeResult = { ok: true; progress: Progress } | { ok: false; error: string };

function validate(value: unknown): DecodeResult {
  if (!value || typeof value !== 'object') return { ok: false, error: 'O backup está vazio ou corrompido.' };
  const obj = value as Record<string, unknown>;
  const candidate = (obj.app === 'miller-minute' ? obj.progress : obj) as Record<string, unknown> | undefined;
  if (!candidate || typeof candidate !== 'object' || typeof candidate.cards !== 'object' || candidate.cards === null) {
    return { ok: false, error: 'Isso não parece um backup do Miller Minute.' };
  }
  if (candidate.version !== undefined && candidate.version !== 1) {
    return { ok: false, error: 'Backup de uma versão desconhecida do app.' };
  }
  return { ok: true, progress: normalizeProgress(candidate as Partial<ReturnType<typeof normalizeProgress>>) };
}

/** Aceita o código "MM1.…" ou o conteúdo do arquivo .json. */
export function decodeBackup(text: string): DecodeResult {
  const trimmed = text.trim();
  try {
    if (trimmed.startsWith(PREFIX)) return validate(JSON.parse(fromBase64Url(trimmed.slice(PREFIX.length))));
    if (trimmed.startsWith('{')) return validate(JSON.parse(trimmed));
  } catch {
    return { ok: false, error: 'Não consegui ler o backup. Confira se copiou o código inteiro.' };
  }
  return { ok: false, error: 'Cole o código que começa com "MM1." ou escolha o arquivo .json do backup.' };
}

/** Resumo para confirmar antes de importar. */
export function describe(progress: Progress): string {
  const words = Object.keys(progress.cards).length;
  const minutes = Math.round(progress.totalMs / 60000);
  return `${words} palavras vistas, ${progress.totalAnswers} respostas, ${minutes} min de estudo, sequência de ${progress.streak} dia(s)`;
}
