'use client';

import dynamic from 'next/dynamic';

const PlaygroundCanvas = dynamic(
  () => import('@/components/canvas/playground-canvas').then((m) => m.PlaygroundCanvas),
  { ssr: false },
);

export default function PlaygroundPage() {
  return (
    <main className="flex min-h-screen flex-col gap-6 p-8">
      <header>
        <h1 className="font-mono text-lg">Playground</h1>
        <p className="text-slate text-sm">
          All 16 pieces in the current theme. Iso-rendered. Designer iteration surface.
        </p>
      </header>
      <section className="h-[70vh] w-full">
        <PlaygroundCanvas />
      </section>
    </main>
  );
}
