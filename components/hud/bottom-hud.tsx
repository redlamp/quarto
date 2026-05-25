'use client';

import { Button } from '@/components/ui/button';

export function BottomHud() {
  return (
    <div className="absolute right-0 bottom-0 left-0 z-10 flex items-center justify-center gap-4 px-6 py-6">
      <div className="bg-surface-muted text-slate flex h-16 w-16 items-center justify-center rounded-md font-mono text-xs">
        piece
      </div>
      <Button variant="default">Confirm</Button>
      <Button variant="outline" disabled>
        Quarto!
      </Button>
    </div>
  );
}
