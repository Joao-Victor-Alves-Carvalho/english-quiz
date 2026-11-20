/**
 * Efeitos sonoros sintetizados com a Web Audio API (sem arquivos de áudio).
 */
let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  try {
    if (!ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

interface Tone {
  freq: number;
  to?: number;
  at: number;
  dur: number;
  type?: OscillatorType;
  gain?: number;
}

function play(tones: readonly Tone[]): void {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + 0.01;
  for (const t of tones) {
    const osc = ac.createOscillator();
    const amp = ac.createGain();
    osc.type = t.type ?? 'sine';
    osc.frequency.setValueAtTime(t.freq, t0 + t.at);
    if (t.to) osc.frequency.exponentialRampToValueAtTime(t.to, t0 + t.at + t.dur);
    const peak = t.gain ?? 0.18;
    amp.gain.setValueAtTime(0.0001, t0 + t.at);
    amp.gain.exponentialRampToValueAtTime(peak, t0 + t.at + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + t.at + t.dur);
    osc.connect(amp).connect(ac.destination);
    osc.start(t0 + t.at);
    osc.stop(t0 + t.at + t.dur + 0.02);
  }
}

/** Acerto: duas notas subindo, com um brilho. */
export function playCorrect(): void {
  play([
    { freq: 784, at: 0, dur: 0.12, type: 'triangle', gain: 0.2 },
    { freq: 1175, at: 0.09, dur: 0.22, type: 'triangle', gain: 0.2 },
    { freq: 2350, at: 0.09, dur: 0.18, type: 'sine', gain: 0.05 },
  ]);
}

/** Erro: nota grave descendo, curta e suave. */
export function playWrong(): void {
  play([
    { freq: 300, to: 180, at: 0, dur: 0.22, type: 'square', gain: 0.07 },
    { freq: 220, to: 140, at: 0.16, dur: 0.28, type: 'square', gain: 0.06 },
  ]);
}

/** Fim de sessão: arpejo. */
export function playComplete(): void {
  play([
    { freq: 523, at: 0, dur: 0.16, type: 'triangle' },
    { freq: 659, at: 0.1, dur: 0.16, type: 'triangle' },
    { freq: 784, at: 0.2, dur: 0.16, type: 'triangle' },
    { freq: 1047, at: 0.3, dur: 0.4, type: 'triangle', gain: 0.2 },
  ]);
}
