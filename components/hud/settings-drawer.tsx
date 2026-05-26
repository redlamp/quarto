'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useUiStore, type OpponentMode } from '@/lib/state/ui-store';

interface SettingsDrawerProps {
  onRestart: () => void;
}

const OPPONENT_OPTIONS: Array<{ value: OpponentMode; label: string }> = [
  { value: 'hot-seat', label: 'Hot-seat' },
  { value: 'ai-random', label: 'AI — Random' },
];

export function SettingsDrawer({ onRestart }: SettingsDrawerProps) {
  const isOpen = useUiStore((s) => s.drawerOpen);
  const setOpen = useUiStore((s) => s.setDrawer);
  const opponent = useUiStore((s) => s.opponent);
  const setOpponent = useUiStore((s) => s.setOpponent);
  const confirmEnabled = useUiStore((s) => s.confirmEnabled);
  const setConfirmEnabled = useUiStore((s) => s.setConfirmEnabled);
  const soundEnabled = useUiStore((s) => s.soundEnabled);
  const setSoundEnabled = useUiStore((s) => s.setSoundEnabled);
  const uiTheme = useUiStore((s) => s.uiTheme);
  const setUiTheme = useUiStore((s) => s.setUiTheme);

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>

        <div className="mt-6 flex flex-col gap-6 text-sm">
          <section className="flex flex-col gap-2">
            <h3 className="text-xs tracking-wider text-slate-500 uppercase">Opponent</h3>
            <div className="flex gap-2">
              {OPPONENT_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  variant={opponent === opt.value ? 'default' : 'outline'}
                  onClick={() => setOpponent(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-xs tracking-wider text-slate-500 uppercase">Play</h3>
            <Button
              variant={confirmEnabled ? 'default' : 'outline'}
              onClick={() => setConfirmEnabled(!confirmEnabled)}
            >
              Confirm step: {confirmEnabled ? 'on' : 'off'}
            </Button>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-xs tracking-wider text-slate-500 uppercase">UI theme</h3>
            <div className="flex gap-2">
              <Button
                variant={uiTheme === 'light' ? 'default' : 'outline'}
                onClick={() => setUiTheme('light')}
              >
                Light
              </Button>
              <Button
                variant={uiTheme === 'dark' ? 'default' : 'outline'}
                onClick={() => setUiTheme('dark')}
              >
                Dark
              </Button>
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-xs tracking-wider text-slate-500 uppercase">3D visuals</h3>
            <p className="text-slate text-xs">Camera, lighting, motion presets — wired in M3.</p>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-xs tracking-wider text-slate-500 uppercase">Audio</h3>
            <Button
              variant={soundEnabled ? 'default' : 'outline'}
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              Sound: {soundEnabled ? 'on' : 'off'}
            </Button>
          </section>

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
