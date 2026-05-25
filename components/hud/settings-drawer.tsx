'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useUiStore } from '@/lib/state/ui-store';

export function SettingsDrawer() {
  const isOpen = useUiStore((s) => s.drawerOpen);
  const setOpen = useUiStore((s) => s.setDrawer);
  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>
        <div className="text-slate mt-4 flex flex-col gap-3 text-sm">
          <p>Opponent picker — TODO</p>
          <p>Camera mode — TODO</p>
          <p>Lighting preset — TODO</p>
          <p>Motion preset — TODO</p>
          <p>Theme picker (dev-flagged) — TODO</p>
          <p>Sound mute — TODO</p>
          <p>Clock preset — TODO</p>
          <p>Confirm step toggle — TODO</p>
          <p>Reset / Restart — TODO</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
