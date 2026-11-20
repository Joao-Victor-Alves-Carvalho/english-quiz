/** Pronúncia em inglês com a voz do próprio aparelho (funciona offline na maioria dos celulares). */
let cachedVoice: SpeechSynthesisVoice | null | undefined;

function pickVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice !== undefined && cachedVoice !== null) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  cachedVoice =
    voices.find((v) => v.lang === 'en-US' && v.localService) ??
    voices.find((v) => v.lang === 'en-US') ??
    voices.find((v) => v.lang.startsWith('en')) ??
    null;
  return cachedVoice;
}

export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speak(text: string, rate = 0.9): void {
  if (!canSpeak()) return;
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = rate;
    const voice = pickVoice();
    if (voice) utterance.voice = voice;
    synth.speak(utterance);
  } catch {
    // Sem voz disponível: segue sem áudio.
  }
}

export function vibrate(pattern: number | number[]): void {
  try {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
  } catch {
    // Alguns navegadores (iPhone) não vibram.
  }
}

/** Lê várias frases em sequência, avisando qual está sendo lida (-1 no fim). */
export function speakSequence(texts: readonly string[], onIndex: (i: number) => void, rate = 0.9): void {
  if (!canSpeak()) return;
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const voice = pickVoice();
    texts.forEach((text, i) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = rate;
      if (voice) u.voice = voice;
      u.onstart = () => onIndex(i);
      if (i === texts.length - 1) u.onend = () => onIndex(-1);
      synth.speak(u);
    });
  } catch {
    onIndex(-1);
  }
}

export function stopSpeaking(): void {
  try {
    if (canSpeak()) window.speechSynthesis.cancel();
  } catch {
    // ignora
  }
}
