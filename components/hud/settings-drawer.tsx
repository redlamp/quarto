'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/lib/theme/context';
import { CLOCK_PRESETS } from '@/lib/clock/math';
import {
  useUiStore,
  type CameraMode,
  type FocalPoint,
  type OpponentMode,
} from '@/lib/state/ui-store';

interface SettingsDrawerProps {
  onRestart: () => void;
}

const OPPONENT_OPTIONS: Array<{ value: OpponentMode; label: string }> = [
  { value: 'hot-seat', label: 'Hot-seat' },
  { value: 'ai-random', label: 'AI — Random' },
];

const CAMERA_OPTIONS: Array<{ value: CameraMode; label: string }> = [
  { value: 'top-down', label: 'Top-down' },
  { value: 'iso', label: 'Isometric' },
  { value: 'orbit', label: 'Free orbit' },
  { value: 'parallax', label: 'Parallax' },
];

const FOCAL_OPTIONS: Array<{ value: FocalPoint; label: string }> = [
  { value: 'board', label: 'Board' },
  { value: 'play-area', label: 'Play area' },
  { value: 'active', label: 'Active player' },
];

interface RangeRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
}

function RangeRow({ label, value, min, max, step, onChange }: RangeRowProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="flex justify-between">
        <span>{label}</span>
        <span className="text-slate-500 tabular-nums">{value.toFixed(2)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="accent-[var(--color-selection)]"
      />
    </label>
  );
}

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

  const { theme, lightingPreset, motionPreset } = useTheme();
  const setLightingPresetName = useUiStore((s) => s.setLightingPresetName);
  const setMotionPresetName = useUiStore((s) => s.setMotionPresetName);
  const lightingPresets = Object.values(theme.lighting);
  const motionPresets = Object.values(theme.motion);

  const clockPresetName = useUiStore((s) => s.clockPresetName);
  const setClockPresetName = useUiStore((s) => s.setClockPresetName);
  const cameraMode = useUiStore((s) => s.cameraMode);
  const setCameraMode = useUiStore((s) => s.setCameraMode);
  const focalPoint = useUiStore((s) => s.focalPoint);
  const setFocalPoint = useUiStore((s) => s.setFocalPoint);
  const parallaxX = useUiStore((s) => s.parallaxX);
  const setParallaxX = useUiStore((s) => s.setParallaxX);
  const parallaxY = useUiStore((s) => s.parallaxY);
  const setParallaxY = useUiStore((s) => s.setParallaxY);
  const parallaxLerp = useUiStore((s) => s.parallaxLerp);
  const setParallaxLerp = useUiStore((s) => s.setParallaxLerp);
  const resetParallax = useUiStore((s) => s.resetParallax);

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
            <h3 className="text-xs tracking-wider text-slate-500 uppercase">Camera</h3>
            <div className="flex flex-wrap gap-2">
              {CAMERA_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  variant={cameraMode === opt.value ? 'default' : 'outline'}
                  onClick={() => setCameraMode(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-xs tracking-wider text-slate-500 uppercase">Focal point</h3>
            <div className="flex flex-wrap gap-2">
              {FOCAL_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  variant={focalPoint === opt.value ? 'default' : 'outline'}
                  onClick={() => setFocalPoint(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-xs tracking-wider text-slate-500 uppercase">
              Parallax
              {cameraMode !== 'parallax' && (
                <span className="ml-2 normal-case opacity-60">(Parallax camera only)</span>
              )}
            </h3>
            <RangeRow
              label="Sway X"
              value={parallaxX}
              min={0}
              max={4}
              step={0.05}
              onChange={setParallaxX}
            />
            <RangeRow
              label="Sway Y"
              value={parallaxY}
              min={0}
              max={4}
              step={0.05}
              onChange={setParallaxY}
            />
            <RangeRow
              label="Smoothing"
              value={parallaxLerp}
              min={0.02}
              max={0.3}
              step={0.01}
              onChange={setParallaxLerp}
            />
            <Button variant="outline" onClick={resetParallax}>
              Reset parallax
            </Button>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-xs tracking-wider text-slate-500 uppercase">Lighting</h3>
            <div className="flex flex-wrap gap-2">
              {lightingPresets.map((preset) => (
                <Button
                  key={preset.name}
                  variant={lightingPreset.name === preset.name ? 'default' : 'outline'}
                  onClick={() => setLightingPresetName(preset.name)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-xs tracking-wider text-slate-500 uppercase">Motion</h3>
            <div className="flex flex-wrap gap-2">
              {motionPresets.map((preset) => (
                <Button
                  key={preset.name}
                  variant={motionPreset.name === preset.name ? 'default' : 'outline'}
                  onClick={() => setMotionPresetName(preset.name)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-xs tracking-wider text-slate-500 uppercase">Clock</h3>
            <div className="flex flex-wrap gap-2">
              {CLOCK_PRESETS.map((preset) => (
                <Button
                  key={preset.name}
                  variant={clockPresetName === preset.name ? 'default' : 'outline'}
                  onClick={() => setClockPresetName(preset.name)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
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
