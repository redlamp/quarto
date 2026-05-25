import type { Theme } from './types';
import { generic } from './generic';

export const themes: Record<string, Theme> = {
  [generic.name]: generic,
};

export const themeNames: readonly string[] = Object.keys(themes);

export function getTheme(name: string): Theme {
  return themes[name] ?? generic;
}

export const defaultTheme = generic;
