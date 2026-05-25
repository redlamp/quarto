'use client';

import { useEffect } from 'react';
import { useUiStore } from '@/lib/state/ui-store';

export function UiThemeSync() {
  const uiTheme = useUiStore((s) => s.uiTheme);
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (uiTheme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [uiTheme]);
  return null;
}
