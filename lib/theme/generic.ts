import type { Theme } from './types';

// Generic v1 baseline. Modern matte / PBR neutral. Cool neutrals — slate, fog,
// snow, ink. Two lighting presets toggleable (HDRI studio + single overhead).
// Three motion presets toggleable (quick, smooth, cinematic).

export const generic: Theme = {
  name: 'generic',
  label: 'Generic',
  colors: {
    surface: '#f4f6f8',
    surfaceMuted: '#8b939e',
    boardSurface: '#5a626d',
    rackSurface: '#6c7480',
    ink: '#1e2128',
    fog: '#a8aeb6',
    pieceLight: '#e8ebef',
    pieceDark: '#1a1d23',
    pieceHollowInset: '#0c0e12',
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
    roughness: 0.45,
    metalness: 0.05,
    highlightEmissive: 0.3,
    hollowDepth: 0.06,
  },
  lighting: {
    'studio-hdri': {
      name: 'studio-hdri',
      label: 'Studio HDRI',
      ambient: 0.45,
      directional: 1.1,
      directionalPosition: [4, 8, 4],
      environment: 'studio',
    },
    'overhead-soft': {
      name: 'overhead-soft',
      label: 'Single overhead',
      ambient: 0.35,
      directional: 1.6,
      directionalPosition: [0, 10, 2],
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
