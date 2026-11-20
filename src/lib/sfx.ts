/**
 * Efeitos sonoros sintetizados com a Web Audio API (sem arquivos de áudio).
 *
 * Celulares pausam o motor de áudio com frequência: depois da voz (speechSynthesis),
 * do microfone, de uma ligação ou quando o app vai para segundo plano. No iPhone o estado
 * fica "interrupted"; no Android, "suspended". Por isso:
 * - todo toque confere o estado e religa o motor antes de tocar;
 * - qualquer toque na tela (gesto do usuário) religa e "destrava" o áudio;
 * - se o motor foi fechado, cria outro.
 */
let ctx: AudioContext | null = null;

function create(): AudioContext | null {
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    return Ctor ? new Ctor() : null;
  } catch {
    return null;
  }
}

function context(): AudioContext | null {
  if (!ctx || ctx.state === 'closed') ctx = create();
  return ctx;
}

/** Garante o motor ligado; resolve com ele pronto (ou null se não houver áudio). */
async function ready(): Promise<AudioContext | null> {
  const ac = context();
  if (!ac) return null;
  if (ac.state === 'running') return ac;
  try {
    await ac.resume();
  } catch {
    // ignora: tenta recriar abaixo
  }
  if ((ac.state as string) === 'running') return ac;
  // Motor travado (acontece no iPhone depois de interrupções): recria.
  try {
    await ac.close();
  } catch {
    // ignora
  }
  ctx = create();
  if (!ctx) return null;
  try {
    await ctx.resume();
  } catch {
    // ignora
  }
  return ctx;
}

/** Toca um som mudo de 1 amostra: no iPhone isso "destrava" o áudio dentro de um gesto. */
function unlock(): void {
  const ac = context();
  if (!ac) return;
  try {
    if (ac.state !== 'running') void ac.resume();
    const buffer = ac.createBuffer(1, 1, 22050);
    const source = ac.createBufferSource();
    source.buffer = buffer;
    source.connect(ac.destination);
    source.start(0);
  } catch {
    // ignora
  }
}

let installed = false;

/** Religa o áudio a cada toque na tela e quando o app volta para a frente. Chamar uma vez. */
export function installAudioUnlock(): void {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  const onGesture = () => {
    if (!ctx || ctx.state !== 'running') unlock();
  };
  for (const type of ['pointerdown', 'touchend', 'keydown'] as const) {
    window.addEventListener(type, onGesture, { capture: true, passive: true });
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && ctx && ctx.state !== 'running') void ctx.resume().catch(() => undefined);
  });
}

interface Tone {
  freq: number;
  to?: number;
  at: number;
  dur: number;
  type?: OscillatorType;
  gain?: number;
}

function schedule(ac: AudioContext, tones: readonly Tone[]): void {
  const t0 = ac.currentTime + 0.02;
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

function play(tones: readonly Tone[]): void {
  const ac = context();
  if (ac && ac.state === 'running') {
    schedule(ac, tones);
    return;
  }
  // Motor pausado: religa primeiro e só então agenda (senão as notas "somem").
  void ready().then((live) => {
    if (live && live.state === 'running') schedule(live, tones);
  });
}

/** Acerto: duas notas subindo, com um brilho. */
export function playCorrect(): void {
  play([
    { freq: 784, at: 0, dur: 0.12, type: 'triangle', gain: 0.22 },
    { freq: 1175, at: 0.09, dur: 0.22, type: 'triangle', gain: 0.22 },
    { freq: 2350, at: 0.09, dur: 0.18, type: 'sine', gain: 0.05 },
  ]);
}

/** Erro: nota grave descendo, curta e suave. */
export function playWrong(): void {
  play([
    { freq: 300, to: 180, at: 0, dur: 0.22, type: 'square', gain: 0.08 },
    { freq: 220, to: 140, at: 0.16, dur: 0.28, type: 'square', gain: 0.07 },
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
