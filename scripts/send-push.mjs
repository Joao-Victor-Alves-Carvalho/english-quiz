/**
 * Envia a notificação do turno (12h ou 21h, Brasília) para o aparelho inscrito.
 * Roda no GitHub Actions (.github/workflows/notify.yml) com dois segredos do repositório:
 *   VAPID_PRIVATE_KEY  — chave privada VAPID
 *   PUSH_SUBSCRIPTION  — código de inscrição copiado em Ajustes → Notificações
 * Uso: node --experimental-strip-types scripts/send-push.mjs [midday|night]
 */
import webpush from 'web-push';
import { pickMessage, slotFor } from '../src/lib/pushMessages.ts';

const PUBLIC_KEY = 'BMrA8utAoZn7hMDu7Jw0WOJWUqb_pSCoGgCBLtqc_2RRqOaXWx2DRzd68_1kaDyTWzaGBnQ3bH9U1YhxG_ENqWE';
const APP_URL = 'https://joao-victor-alves-carvalho.github.io/miller-minute/';

const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
const rawSubscription = process.env.PUSH_SUBSCRIPTION?.trim();

if (!privateKey || !rawSubscription) {
  console.log('Notificações ainda não configuradas: faltam os segredos VAPID_PRIVATE_KEY e/ou PUSH_SUBSCRIPTION. Nada enviado.');
  process.exit(0);
}

let subscriptions;
try {
  const parsed = JSON.parse(rawSubscription);
  // Aceita um aparelho ({...}) ou vários ([{...}, {...}]).
  subscriptions = Array.isArray(parsed) ? parsed : [parsed];
} catch {
  console.error('PUSH_SUBSCRIPTION não é um JSON válido. Copie de novo o código em Ajustes → Notificações.');
  process.exit(1);
}

const arg = process.argv[2];
const now = new Date();
const slot = arg === 'midday' || arg === 'night' ? arg : slotFor(now);
const message = pickMessage(slot, now);
const payload = JSON.stringify({ ...message, url: APP_URL, tag: `miller-minute-${slot}` });

webpush.setVapidDetails(APP_URL, PUBLIC_KEY, privateKey);

let failed = 0;
for (const [i, sub] of subscriptions.entries()) {
  try {
    const res = await webpush.sendNotification(sub, payload, { TTL: 4 * 60 * 60, urgency: 'normal' });
    console.log(`Aparelho ${i + 1}: enviado (${res.statusCode}) → "${message.title}"`);
  } catch (err) {
    failed++;
    const code = err?.statusCode;
    if (code === 404 || code === 410) {
      console.error(`Aparelho ${i + 1}: inscrição expirada (${code}). Ative as notificações de novo no app e atualize o segredo PUSH_SUBSCRIPTION.`);
    } else if (code === 401 || code === 403) {
      console.error(`Aparelho ${i + 1}: chave recusada (${code}). Confira o segredo VAPID_PRIVATE_KEY.`);
    } else {
      console.error(`Aparelho ${i + 1}: falha ao enviar (${code ?? 'sem código'}): ${err?.body || err?.message || err}`);
    }
  }
}
process.exit(failed > 0 ? 1 : 0);
