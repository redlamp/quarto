import type { Theme } from './types';

// Generic v1 baseline. Modern matte / PBR neutral. Cool neutrals — slate, fog,
// snow, ink. Two lighting presets toggleable (HDRI studio + single overhead).
// Three motion presets toggleable (quick, smooth, cinematic).

export const generic: Theme = {
  name: 'generic',
  label: 'Generic',
  colors: {
    surface: '#f4f6f8',
    surfaceMuted: '#7a808a',
    groundSurface: '#3f444b',
    boardSurface: '#5a626d',
    rackSurface: '#6c7480',
    ink: '#1e2128',
    fog: '#a8aeb6',
    pieceLight: '#e8ebef',
    pieceDark: '#1a1d23',
    pieceHollowInset: '#82868d',
    accent: '#7d8a9e',
    selection: '#ff8a2a',
    winLine: '#f3e4c0',
    winLineEmissive: '#c9a866',
    pendingCell: '#9fb1cc',
  },
  piece: {
    cellPitch: 0.85,
    cellSize: 0.78,
    radius: 0.28,
    heightTall: 0.7,
    heightShort: 0.4,
    roughness: 0.95,
    metalness: 0,
    hollowDepth: 0.06,
  },
  lighting: {
    // Glare control: directional light reflects off the board (XZ plane) to
    // (x, y, -z). Camera sits at roughly (-1, +7.5, +7.8). To keep the
    // reflection out of the camera frustum, the light's z must match the
    // camera's z (positive) — then the reflection bounces to -z, away from
    // the lens. Light biased to camera-left (-x) puts the highlight on the
    // opposite side of the board from the lens.
    'studio-hdri': {
      name: 'studio-hdri',
      label: 'Studio HDRI',
      ambient: 0.55,
      directional: 0.75,
      // High + camera-side z (positive). Reflection off the board bounces to
      // -z (away from the lens); the extra height keeps the specular hot-spot
      // off the pieces as the camera orbits low.
      directionalPosition: [-4, 15, 7],
      environment: 'studio',
    },
    'overhead-soft': {
      name: 'overhead-soft',
      label: 'Single overhead',
      ambient: 0.45,
      directional: 1.05,
      directionalPosition: [-3, 14, 5],
      environment: null,
    },
  },
  defaultLightingPreset: 'studio-hdri',
  motion: {
    quick: { name: 'quick', label: 'Quick & crisp', base: 150, cinematic: 350, ease: 'power2.out' },
    smooth: {
      name: 'smooth',
      label: 'Considered & smooth',
      base: 280,
      cinematic: 600,
      ease: 'power3.out',
    },
    cinematic: {
      name: 'cinematic',
      label: 'Cinematic',
      base: 500,
      cinematic: 1100,
      ease: 'power4.inOut',
    },
  },
  defaultMotionPreset: 'smooth',
};
