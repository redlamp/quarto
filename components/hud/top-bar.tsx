'use client';

import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon } from 'lucide-react';
import { useUiStore } from '@/lib/state/ui-store';

export function TopBar() {
  const openDrawer = useUiStore((s) => s.openDrawer);
  return (
    <header className="absolute top-0 right-0 left-0 z-10 flex items-center justify-between px-6 py-4">
      <div className="font-mono text-sm tracking-tight">Quarto</div>
      <div aria-live="polite" className="text-slate text-sm">
        Turn stub
      </div>
      <Button variant="ghost" size="icon" aria-label="Open settings" onClick={openDrawer}>
        <SettingsIcon className="h-5 w-5" />
      </Button>
    </header>
  );
}
