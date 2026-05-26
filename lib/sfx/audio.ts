// Singleton AudioContext + master chain (gain → compressor → destination).
// Tiny module so a UI sound trigger doesn't pull in synth definitions.
// Pattern ported from color-taylor/src/utils/audioContext.ts.

let ctx: AudioContext | null = null;
let masterGainNode: GainNode | null = null;
let masterCompressor: DynamicsCompressorNode | null = null;

export function getAudioCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

export function getMasterGain(): GainNode | null {
  const audio = getAudioCtx();
  if (!audio) return null;
  if (!masterCompressor) {
    masterCompressor = audio.createDynamicsCompressor();
    masterCompressor.threshold.value = -3;
    masterCompressor.knee.value = 20;
    masterCompressor.ratio.value = 2;
    masterCompressor.attack.value = 0.02;
    masterCompressor.release.value = 0.25;
    masterCompressor.connect(audio.destination);
  }
  if (!masterGainNode) {
    masterGainNode = audio.createGain();
    masterGainNode.gain.value = 0.8;
    masterGainNode.connect(masterCompressor);
  }
  return masterGainNode;
}

export function setMasterVolume(value: number): void {
  const gain = getMasterGain();
  if (!gain) return;
  const audio = getAudioCtx();
  if (!audio) return;
  gain.gain.setTargetAtTime(value, audio.currentTime, 0.02);
}
