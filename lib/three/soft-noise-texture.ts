import { CanvasTexture, RepeatWrapping } from 'three';

// Soft grayscale noise used as a roughnessMap. Gives the plug ("gem") a faint
// micro-texture so it reads like soft-touch device plastic rather than a glassy
// uniform surface. Built once and shared across every piece.
let cached: CanvasTexture | null = null;

export function getSoftNoiseTexture(): CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  if (cached) return cached;

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Mid-grey speckle with modest contrast — keeps roughness variation subtle.
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 150 + (Math.random() - 0.5) * 70;
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);

  // Blur the speckle into soft blobs so it reads as a satin micro-texture, not
  // sharp static.
  ctx.filter = 'blur(1.2px)';
  ctx.drawImage(canvas, 0, 0);
  ctx.filter = 'none';

  const tex = new CanvasTexture(canvas);
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  tex.repeat.set(2, 2);
  cached = tex;
  return tex;
}
