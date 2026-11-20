/**
 * Notificações push (Web Push). O envio é feito por uma tarefa agendada do GitHub Actions
 * às 12h e às 21h (horário de Brasília), usando o "código de inscrição" deste aparelho,
 * que você guarda como segredo no repositório.
 */

/** Chave pública VAPID (a privada fica só no segredo VAPID_PRIVATE_KEY do GitHub). */
export const VAPID_PUBLIC_KEY = 'BMrA8utAoZn7hMDu7Jw0WOJWUqb_pSCoGgCBLtqc_2RRqOaXWx2DRzd68_1kaDyTWzaGBnQ3bH9U1YhxG_ENqWE';

export type PushStatus =
  | { kind: 'unsupported'; reason: string }
  | { kind: 'needs-install' }
  | { kind: 'denied' }
  | { kind: 'off' }
  | { kind: 'on'; code: string };

function isIos(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function isStandalone(): boolean {
  return window.matchMedia?.('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const pad = '='.repeat((4 - (value.length % 4)) % 4);
  const b64 = (value + pad).replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64);
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Código de inscrição: o JSON da inscrição, que vai no segredo PUSH_SUBSCRIPTION. */
export function subscriptionCode(sub: PushSubscription): string {
  return JSON.stringify(sub.toJSON());
}

async function registration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    return await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000)),
    ]);
  } catch {
    return null;
  }
}

export async function pushStatus(): Promise<PushStatus> {
  if (isIos() && !isStandalone()) return { kind: 'needs-install' };
  if (!('Notification' in window) || !('PushManager' in window) || !('serviceWorker' in navigator)) {
    return { kind: 'unsupported', reason: 'Este navegador não recebe notificações de apps web.' };
  }
  if (Notification.permission === 'denied') return { kind: 'denied' };
  const reg = await registration();
  if (!reg) return { kind: 'unsupported', reason: 'O app ainda não terminou de instalar. Abra de novo com internet.' };
  const sub = await reg.pushManager.getSubscription();
  return sub ? { kind: 'on', code: subscriptionCode(sub) } : { kind: 'off' };
}

/** Pede permissão e cria a inscrição (precisa ser chamado num toque do usuário). */
export async function enablePush(): Promise<PushStatus> {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return permission === 'denied' ? { kind: 'denied' } : { kind: 'off' };
  const reg = await registration();
  if (!reg) return { kind: 'unsupported', reason: 'O app ainda não terminou de instalar. Abra de novo com internet.' };
  const existing = await reg.pushManager.getSubscription();
  const sub =
    existing ??
    (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64UrlToBytes(VAPID_PUBLIC_KEY) }));
  return { kind: 'on', code: subscriptionCode(sub) };
}

export async function disablePush(): Promise<PushStatus> {
  const reg = await registration();
  const sub = await reg?.pushManager.getSubscription();
  await sub?.unsubscribe();
  return { kind: 'off' };
}

/** Mostra uma notificação de teste agora (sem passar pelo GitHub). */
export async function testNotification(): Promise<boolean> {
  const reg = await registration();
  if (!reg || Notification.permission !== 'granted') return false;
  await reg.showNotification('🪐 Teste do Miller Minute', {
    body: 'Se você está vendo isto, as notificações deste aparelho funcionam.',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    tag: 'miller-minute-teste',
  });
  return true;
}
