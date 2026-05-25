'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useUiStore } from '@/lib/state/ui-store';

interface SettingsDrawerProps {
  onRestart: () => void;
}

export function SettingsDrawer({ onRestart }: SettingsDrawerProps) {
  const isOpen = useUiStore((s) => s.drawerOpen);
  const setOpen = useUiStore((s) => s.setDrawer);
  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>
        <div className="text-slate mt-4 flex flex-col gap-3 text-sm">
          <p>Opponent picker — TODO (M2)</p>
          <p>Camera mode — TODO (M3)</p>
          <p>Lighting preset — TODO (M2)</p>
          <p>Motion preset — TODO (M3)</p>
          <p>Theme picker (dev-flagged) — TODO (M2)</p>
          <p>Sound mute — TODO (M3)</p>
          <p>Clock preset — TODO (M3)</p>
          <p>Confirm step toggle — TODO</p>
          <Button
            variant="outline"
            onClick={() => {
              if (window.confirm('Restart the game?')) {
                onRestart();
                setOpen(false);
              }
            }}
          >
            Restart game
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
