/**
 * Lembrete diário sem servidor: um evento recorrente (.ics) para a agenda do celular,
 * com alarme na hora do evento e o link do app.
 */
function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function stamp(d: Date): string {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

export function parseTime(time: string): { h: number; m: number } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 23 || m > 59) return null;
  return { h, m };
}

/** Gera o .ics de um lembrete diário às `time` (hora local), começando no próximo horário. */
export function buildReminderIcs(time: string, url: string, now: Date): string {
  const t = parseTime(time) ?? { h: 20, m: 0 };
  const start = new Date(now);
  start.setHours(t.h, t.m, 0, 0);
  if (start.getTime() <= now.getTime()) start.setDate(start.getDate() + 1);
  const local = `${start.getFullYear()}${pad(start.getMonth() + 1)}${pad(start.getDate())}T${pad(t.h)}${pad(t.m)}00`;
  const endDate = new Date(start.getTime() + 10 * 60_000);
  const localEnd = `${endDate.getFullYear()}${pad(endDate.getMonth() + 1)}${pad(endDate.getDate())}T${pad(endDate.getHours())}${pad(endDate.getMinutes())}00`;
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Miller Minute//Lembrete//PT',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:miller-minute-lembrete-${pad(t.h)}${pad(t.m)}@miller-minute`,
    `DTSTAMP:${stamp(now)}`,
    `DTSTART:${local}`,
    `DTEND:${localEnd}`,
    'RRULE:FREQ=DAILY',
    'SUMMARY:🪐 Miller Minute: hora do inglês',
    `DESCRIPTION:Alguns minutos aqui valem anos lá. Abra o app: ${url}`,
    `URL:${url}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Hora do inglês no Miller Minute',
    'TRIGGER:PT0M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n');
}
