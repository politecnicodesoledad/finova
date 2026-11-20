/**
 * FINOVA Sound Engine — Web Audio API synthesized sounds (soft kalimba, sparkles,
 * coins and fanfare). Identical frequencies/envelopes to the original prototype.
 */
type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

let ctx: AudioContext | null = null;
let enabled = true;
const listeners = new Set<() => void>();

export function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AudioCtx = window.AudioContext || (window as WebkitWindow).webkitAudioContext;
    if (AudioCtx) ctx = new AudioCtx();
  }
  if (ctx && ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

export function playTone(
  freq: number,
  duration = 0.14,
  type: OscillatorType = "sine",
  volume = 0.14,
  delay = 0,
  slideTo: number | null = null,
) {
  if (!enabled) return;
  const audio = getAudioContext();
  if (!audio) return;

  const now = audio.currentTime + delay;
  const osc = audio.createOscillator();
  const gain = audio.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

export const SoundFX = {
  isEnabled: () => enabled,
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  toggle() {
    enabled = !enabled;
    if (enabled) SoundFX.click();
    listeners.forEach((l) => l());
    return enabled;
  },
  click: () => playTone(587.33, 0.09, "sine", 0.11, 0, 740),
  tab: () => {
    playTone(523.25, 0.08, "triangle", 0.1, 0);
    playTone(659.25, 0.1, "sine", 0.1, 0.045);
  },
  coin: () => {
    playTone(987.77, 0.1, "sine", 0.14, 0);
    playTone(1318.51, 0.22, "triangle", 0.14, 0.06);
  },
  gem: () => {
    playTone(1046.5, 0.09, "sine", 0.14, 0);
    playTone(1318.5, 0.09, "sine", 0.14, 0.05);
    playTone(1567.98, 0.25, "triangle", 0.16, 0.1);
  },
  powerup: () => {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => playTone(f, 0.13, "sine", 0.13, idx * 0.05));
  },
  hit: () => playTone(230, 0.22, "sawtooth", 0.11, 0, 110),
  success: () => {
    [523.25, 659.25, 783.99, 1046.5].forEach((n, i) => playTone(n, 0.18, "triangle", 0.15, i * 0.08));
  },
  levelUp: () => {
    [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98].forEach((n, i) => playTone(n, 0.2, "sine", 0.15, i * 0.07));
  },
};
