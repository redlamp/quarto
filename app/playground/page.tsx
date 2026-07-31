'use client';

import dynamic from 'next/dynamic';
import { VARIANTS } from '@/lib/game/variants';

const PlaygroundCanvas = dynamic(
  () => import('@/components/canvas/playground-canvas').then((m) => m.PlaygroundCanvas),
  { ssr: false },
);

export default function PlaygroundPage() {
  return (
    <main className="flex min-h-screen flex-col gap-10 p-8">
      <header>
        <h1 className="font-mono text-lg">Playground</h1>
        <p className="text-slate text-sm">
          Every variant&apos;s full piece set in the current theme. Iso-rendered. Designer iteration
          surface.
        </p>
      </header>
      {VARIANTS.map((variant) => (
        <section key={variant.id} className="flex flex-col gap-2">
          <h2 className="font-mono text-sm">
            {variant.label} — {variant.pieceCount} pieces
          </h2>
          <p className="text-xs text-slate-500">{variant.description}</p>
          <div className="h-[60vh] w-full">
            <PlaygroundCanvas variant={variant} />
          </div>
        </section>
      ))}
    </main>
  );
}
