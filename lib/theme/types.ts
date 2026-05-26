// Theme contract. Visual layer is swappable without touching game logic.
// Themes are pure TypeScript modules. Registry maps theme name to module.

export interface ThemeColors {
  surface: string;
  surfaceMuted: string;
  groundSurface: string;
  boardSurface: string;
  rackSurface: string;
  ink: string;
  fog: string;
  pieceLight: string;
  pieceDark: string;
  pieceHollowInset: string;
  accent: string;
  selection: string;
  winLine: string;
  winLineEmissive: string;
  pendingCell: string;
}

export interface PiecePresentation {
  cellPitch: number;
  cellSize: number;
  radius: number;
  heightTall: number;
  heightShort: number;
  roughness: number;
  metalness: number;
  hollowDepth: number;
}

export type LightingPresetName = string;

export interface LightingPreset {
  name: LightingPresetName;
  label: string;
  ambient: number;
  directional: number;
  directionalPosition: [number, number, number];
  environment: 'studio' | 'city' | 'apartment' | 'park' | 'sunset' | 'warehouse' | 'forest' | null;
}

export type MotionPresetName = string;

export interface MotionPreset {
  name: MotionPresetName;
  label: string;
  base: number; // ms — base ease-out duration for state transitions
  cinematic: number; // ms — duration for scripted cinematic moves
  ease: string; // gsap-style ease string
}

export interface Theme {
  name: string;
  label: string;
  colors: ThemeColors;
  piece: PiecePresentation;
  lighting: Record<LightingPresetName, LightingPreset>;
  defaultLightingPreset: LightingPresetName;
  motion: Record<MotionPresetName, MotionPreset>;
  defaultMotionPreset: MotionPresetName;
}
