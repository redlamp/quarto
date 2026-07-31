'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTheme } from '@/lib/theme/context';
import { CLOCK_PRESETS } from '@/lib/clock/math';
import { VARIANTS, getVariant } from '@/lib/game/variants';
import {
  useUiStore,
  type CameraMode,
  type FocalPoint,
  type OpponentMode,
  type UiTheme,
} from '@/lib/state/ui-store';

interface SettingsDrawerProps {
  onRestart: () => void;
}

const SELECT_TRIGGER_W = 'w-40';

const VARIANT_OPTIONS = VARIANTS.map((v) => ({ value: v.id, label: v.label }));

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

const THEME_OPTIONS: Array<{ value: UiTheme; label: string }> = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 border-b border-black/5 pb-5 last:border-0 last:pb-0">
      <h3 className="text-xs tracking-wider text-slate-500 uppercase">{title}</h3>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label className="text-[var(--color-ink)]">{label}</Label>
      {children}
    </div>
  );
}

function Picker<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (v: T) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as T)}>
      <SelectTrigger aria-label={label} className={SELECT_TRIGGER_W}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

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
  const variantId = useUiStore((s) => s.variantId);
  const setVariantId = useUiStore((s) => s.setVariantId);
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
  const lightingOptions = Object.values(theme.lighting).map((p) => ({
    value: p.name,
    label: p.label,
  }));
  const motionOptions = Object.values(theme.motion).map((p) => ({ value: p.name, label: p.label }));
  const clockOptions = CLOCK_PRESETS.map((p) => ({ value: p.name, label: p.label }));

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

        <div className="mt-6 flex flex-col gap-5 text-sm">
          <Group title="Play">
            <Field label="Variant">
              <Picker
                label="Variant"
                value={variantId}
                options={VARIANT_OPTIONS}
                onChange={setVariantId}
              />
            </Field>
            <p className="text-xs text-slate-500">{getVariant(variantId).description}</p>
            <Field label="Opponent">
              <Picker
                label="Opponent"
                value={opponent}
                options={OPPONENT_OPTIONS}
                onChange={setOpponent}
              />
            </Field>
            <Field label="Clock">
              <Picker
                label="Clock"
                value={clockPresetName}
                options={clockOptions}
                onChange={setClockPresetName}
              />
            </Field>
            <Field label="Confirm step">
              <Switch
                aria-label="Confirm step"
                checked={confirmEnabled}
                onCheckedChange={setConfirmEnabled}
              />
            </Field>
          </Group>

          <Group title="Camera">
            <Field label="Mode">
              <Picker
                label="Camera mode"
                value={cameraMode}
                options={CAMERA_OPTIONS}
                onChange={setCameraMode}
              />
            </Field>
            <Field label="Focal point">
              <Picker
                label="Focal point"
                value={focalPoint}
                options={FOCAL_OPTIONS}
                onChange={setFocalPoint}
              />
            </Field>
            <details className="rounded-md border border-black/10 px-3 py-2">
              <summary className="cursor-pointer text-slate-500 select-none">
                Parallax tuning
              </summary>
              <div className="mt-3 flex flex-col gap-3">
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
              </div>
            </details>
          </Group>

          <Group title="Appearance">
            <Field label="Theme">
              <Picker label="Theme" value={uiTheme} options={THEME_OPTIONS} onChange={setUiTheme} />
            </Field>
            <Field label="Lighting">
              <Picker
                label="Lighting"
                value={lightingPreset.name}
                options={lightingOptions}
                onChange={setLightingPresetName}
              />
            </Field>
            <Field label="Motion">
              <Picker
                label="Motion"
                value={motionPreset.name}
                options={motionOptions}
                onChange={setMotionPresetName}
              />
            </Field>
          </Group>

          <Group title="Audio">
            <Field label="Sound">
              <Switch aria-label="Sound" checked={soundEnabled} onCheckedChange={setSoundEnabled} />
            </Field>
          </Group>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">Restart game</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Restart the game?</AlertDialogTitle>
                <AlertDialogDescription>
                  Current board state will be discarded.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    onRestart();
                    setOpen(false);
                  }}
                >
                  Restart
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SheetContent>
    </Sheet>
  );
}
