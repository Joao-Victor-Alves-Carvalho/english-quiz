/**
 * Mensagens das notificações diárias (12h e 21h, horário de Brasília).
 * Sem imports: este arquivo também é lido pelo script de envio no GitHub Actions.
 * A notificação não sabe do seu progresso (ele fica só no celular), então as mensagens são
 * lembretes temáticos que mudam a cada dia.
 */
export type Slot = 'midday' | 'night';

export interface PushMessage {
  title: string;
  body: string;
}

export const MESSAGES: Record<Slot, PushMessage[]> = {
  midday: [
    { title: '🪐 Hora do inglês', body: 'Em Miller não passou nem 1 segundo desde ontem. Aqui já dá para uma sessão rápida.' },
    { title: '☕ Pausa do almoço?', body: '5 minutos de Miller Minute rendem mais que 1 hora de estudo desorganizado.' },
    { title: '🎯 Meta do dia', body: 'Comece agora e bata a meta antes da noite. Suas revisões estão esperando.' },
    { title: '🛰️ Sinal da Endurance', body: 'Tripulante, temos palavras para revisar. Responda o chamado!' },
    { title: '🧠 Antes que esqueça', body: 'O melhor momento para revisar é logo antes de esquecer. Esse momento é agora.' },
    { title: '💬 Situação real', body: 'Que tal pedir um café em inglês hoje? Tem uma conversa nova esperando por você.' },
    { title: '📖 Uma história curta', body: 'Leia e ouça uma história de 8 frases. Leva 3 minutos.' },
    { title: '⏳ Uma hora em Miller', body: 'Cada minuto de estudo aqui vale muito mais do que parece. Bora?' },
  ],
  night: [
    { title: '🌌 Último chamado do dia', body: 'Ainda dá tempo de manter a sua sequência. Uma sessão rápida antes de dormir?' },
    { title: '🔥 Não deixe a chama apagar', body: 'Sua sequência de dias depende dos próximos minutos. Vamos?' },
    { title: '🌙 Revisão da noite', body: 'Revisar antes de dormir ajuda a memória a fixar. 5 minutos bastam.' },
    { title: '🕳️ Gargantua está chamando', body: 'O tempo passa diferente aqui. Use alguns minutos dele para o inglês.' },
    { title: '🎧 Ouvido afiado', body: 'Um ditado rápido de 6 frases para fechar o dia?' },
    { title: '📕 Caderno de erros', body: 'Transforme os erros de hoje em acertos de amanhã. Leva poucos minutos.' },
    { title: '⭐ Missão do dia', body: 'Você bateu a meta hoje? Se não, ainda dá tempo.' },
    { title: '🚀 Antes de pousar', body: 'Uma última sessão antes de encerrar o dia. A tripulação conta com você.' },
  ],
};

/** Dia do ano (1–366) no fuso de Brasília. */
export function dayOfYear(date: Date): number {
  const brt = new Date(date.getTime() - 3 * 60 * 60 * 1000);
  const start = Date.UTC(brt.getUTCFullYear(), 0, 1);
  return Math.floor((brt.getTime() - start) / 86_400_000) + 1;
}

/** Turno pelo horário de Brasília (UTC-3): antes das 17h é o do meio-dia; depois, o da noite. */
export function slotFor(date: Date): Slot {
  const brtHour = (date.getUTCHours() + 24 - 3) % 24;
  return brtHour >= 6 && brtHour < 17 ? 'midday' : 'night';
}

/** Mensagem do dia: muda a cada dia, sem repetir em dias seguidos. */
export function pickMessage(slot: Slot, date: Date): PushMessage {
  const list = MESSAGES[slot];
  return list[dayOfYear(date) % list.length] as PushMessage;
}
