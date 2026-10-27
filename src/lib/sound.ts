// Tiny Web Audio synth for tactile game sounds. Browser-only; call from handlers.
let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(m: boolean) {
  muted = m;
}

function ac() {
  if (typeof window === "undefined") return null;
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType = "sine", vol = 0.2, delay = 0, slideTo?: number) {
  const a = ac();
  if (!a || muted) return;
  const t = a.currentTime + delay;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise(dur: number, vol = 0.2, delay = 0, freq = 2000) {
  const a = ac();
  if (!a || muted) return;
  const t = a.currentTime + delay;
  const buf = a.createBuffer(1, Math.max(1, Math.floor(a.sampleRate * dur)), a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const s = a.createBufferSource();
  s.buffer = buf;
  const f = a.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = freq;
  const g = a.createGain();
  g.gain.value = vol;
  s.connect(f).connect(g).connect(a.destination);
  s.start(t);
}

export const sfx = {
  click: () => tone(900, 0.05, "square", 0.06),
  chalk: () => noise(0.18, 0.35, 0, 3500),
  card: () => noise(0.08, 0.5, 0, 4000),
  flip: () => { noise(0.05, 0.4, 0, 5000); tone(1200, 0.04, "triangle", 0.05); },
  chip: () => { tone(2400, 0.06, "triangle", 0.12); tone(3100, 0.05, "triangle", 0.08, 0.04); },
  dice: () => { for (let i = 0; i < 7; i++) noise(0.04, 0.5, i * 0.07 + Math.random() * 0.03, 1500 + Math.random() * 1500); },
  tick: () => tone(1800, 0.02, "square", 0.04),
  thud: () => { tone(140, 0.18, "sine", 0.4, 0, 60); noise(0.06, 0.3, 0, 600); },
  lever: () => { tone(300, 0.3, "sawtooth", 0.08, 0, 120); noise(0.2, 0.2, 0, 800); },
  buzzer: () => tone(140, 0.5, "sawtooth", 0.2),
  ding: () => { tone(1320, 0.4, "sine", 0.2); tone(1760, 0.5, "sine", 0.12, 0.08); },
  lose: () => { tone(392, 0.25, "triangle", 0.2); tone(330, 0.25, "triangle", 0.2, 0.2); tone(262, 0.5, "triangle", 0.2, 0.4); },
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.3, "triangle", 0.2, i * 0.11)),
  // Slot machine: classic square/saw oscillator voice.
  slotPull: () => { tone(110, 0.35, "sawtooth", 0.12, 0, 55); noise(0.25, 0.15, 0, 700); tone(220, 0.08, "square", 0.06, 0.35); },
  slotTick: () => tone(120 + Math.random() * 120, 0.03, "square", 0.05),
  slotStop: () => { tone(90, 0.12, "square", 0.15, 0, 60); tone(180, 0.06, "sawtooth", 0.08); },
  slotWin: () => [523, 659, 784].forEach((f, i) => { tone(f, 0.18, "square", 0.08, i * 0.1); tone(f * 1.005, 0.18, "sawtooth", 0.05, i * 0.1); }),
  pageFlip: () => { noise(0.25, 0.25, 0, 3000); noise(0.12, 0.2, 0.18, 1800); },
  clock: () => { tone(800, 0.03, "square", 0.08); noise(0.05, 0.4, 0, 1200); },
  jackpot: () => {
    [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => { tone(f, 0.25, "square", 0.1, i * 0.1); tone(f * 1.01, 0.25, "sawtooth", 0.06, i * 0.1); });
    for (let i = 0; i < 14; i++) tone(2400 + Math.random() * 800, 0.06, "triangle", 0.06, 0.8 + i * 0.07);
  },
};
