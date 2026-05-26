// Named one-shot SFX generators for the Quarto UI.
// Each event spawns short-lived oscillator → filter → gain nodes, plays its
// envelope, and disposes itself when complete. No persistent voices.

import { getAudioCtx, getMasterGain } from './audio';

export type SfxName =
  | 'piece-pick'
  | 'piece-place'
  | 'confirm'
  | 'handoff'
  | 'quarto-call'
  | 'win-fanfare';

interface BlipOpts {
  freq: number;
  type?: OscillatorType;
  duration?: number;
  attack?: number;
  release?: number;
  peakGain?: number;
  filter?: { type: BiquadFilterType; frequency: number; q?: number };
  detune?: number;
}

function blip({
  freq,
  type = 'sine',
  duration = 0.12,
  attack = 0.005,
  release,
  peakGain = 0.25,
  filter,
  detune = 0,
}: BlipOpts): void {
  const audio = getAudioCtx();
  const master = getMasterGain();
  if (!audio || !master) return;
  const now = audio.currentTime;
  const rel = release ?? duration * 0.8;
  const osc = audio.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;
  osc.detune.value = detune;

  const gain = audio.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(peakGain, now + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + attack + rel);

  let head: AudioNode = osc;
  if (filter) {
    const f = audio.createBiquadFilter();
    f.type = filter.type;
    f.frequency.value = filter.frequency;
    if (filter.q !== undefined) f.Q.value = filter.q;
    osc.connect(f);
    head = f;
  }
  head.connect(gain);
  gain.connect(master);

  osc.start(now);
  osc.stop(now + attack + rel + 0.05);
  osc.onended = () => {
    osc.disconnect();
    gain.disconnect();
  };
}

function sweep(opts: BlipOpts & { endFreq: number; sweepDuration?: number }): void {
  const audio = getAudioCtx();
  const master = getMasterGain();
  if (!audio || !master) return;
  const now = audio.currentTime;
  const duration = opts.duration ?? 0.2;
  const sweepDur = opts.sweepDuration ?? duration;
  const release = opts.release ?? duration * 0.7;
  const peak = opts.peakGain ?? 0.25;

  const osc = audio.createOscillator();
  osc.type = opts.type ?? 'sine';
  osc.frequency.setValueAtTime(opts.freq, now);
  osc.frequency.exponentialRampToValueAtTime(opts.endFreq, now + sweepDur);

  const gain = audio.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(peak, now + (opts.attack ?? 0.01));
  gain.gain.exponentialRampToValueAtTime(0.0001, now + (opts.attack ?? 0.01) + release);

  let head: AudioNode = osc;
  if (opts.filter) {
    const f = audio.createBiquadFilter();
    f.type = opts.filter.type;
    f.frequency.value = opts.filter.frequency;
    if (opts.filter.q !== undefined) f.Q.value = opts.filter.q;
    osc.connect(f);
    head = f;
  }
  head.connect(gain);
  gain.connect(master);
  osc.start(now);
  osc.stop(now + duration + 0.05);
  osc.onended = () => {
    osc.disconnect();
    gain.disconnect();
  };
}

function chord(freqs: number[], duration: number, peakGain = 0.18): void {
  for (let i = 0; i < freqs.length; i++) {
    blip({
      freq: freqs[i]!,
      type: 'triangle',
      duration,
      attack: 0.02 + i * 0.02,
      release: duration * 0.85,
      peakGain,
      filter: { type: 'lowpass', frequency: 3200, q: 0.6 },
    });
  }
}

export function playSfx(name: SfxName): void {
  switch (name) {
    case 'piece-pick':
      blip({
        freq: 880,
        type: 'sine',
        duration: 0.08,
        attack: 0.003,
        release: 0.07,
        peakGain: 0.18,
        filter: { type: 'lowpass', frequency: 3000 },
      });
      return;
    case 'piece-place':
      // Two-stage thunk: a wood-click and a low body resonance.
      blip({
        freq: 220,
        type: 'square',
        duration: 0.06,
        attack: 0.002,
        release: 0.05,
        peakGain: 0.22,
        filter: { type: 'lowpass', frequency: 1400, q: 0.7 },
      });
      blip({
        freq: 110,
        type: 'sine',
        duration: 0.18,
        attack: 0.004,
        release: 0.15,
        peakGain: 0.16,
        filter: { type: 'lowpass', frequency: 600 },
      });
      return;
    case 'confirm':
      blip({
        freq: 660,
        type: 'triangle',
        duration: 0.1,
        attack: 0.005,
        release: 0.09,
        peakGain: 0.18,
        filter: { type: 'lowpass', frequency: 2500 },
      });
      return;
    case 'handoff':
      sweep({
        freq: 320,
        endFreq: 720,
        type: 'sine',
        duration: 0.32,
        sweepDuration: 0.3,
        attack: 0.02,
        release: 0.28,
        peakGain: 0.2,
        filter: { type: 'lowpass', frequency: 2400, q: 0.6 },
      });
      return;
    case 'quarto-call':
      blip({
        freq: 523.25, // C5
        type: 'triangle',
        duration: 0.22,
        attack: 0.01,
        release: 0.18,
        peakGain: 0.26,
        filter: { type: 'lowpass', frequency: 3200 },
      });
      blip({
        freq: 783.99, // G5
        type: 'triangle',
        duration: 0.28,
        attack: 0.06,
        release: 0.24,
        peakGain: 0.22,
        filter: { type: 'lowpass', frequency: 3200 },
      });
      return;
    case 'win-fanfare':
      // C major triad over a half-second, second voice up an octave.
      chord([261.63, 329.63, 392.0], 0.55, 0.18);
      setTimeout(() => chord([523.25, 659.25, 783.99], 0.6, 0.16), 220);
      return;
  }
}
