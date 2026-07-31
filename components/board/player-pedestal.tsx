'use client';

import { PieceMesh } from '@/components/pieces/piece-mesh';
import { useTheme } from '@/lib/theme/context';
import { useFlightStore } from '@/lib/state/flight-store';
import type { Piece } from '@/lib/game/pieces';
import type { VariantDef } from '@/lib/game/variants';

interface PlayerPedestalProps {
  variant: VariantDef;
  playerID: '0' | '1';
  piece: Piece | null;
  highlighted: boolean;
}

// P0 sits at +z (front), P1 at -z (back).
const Z_BY_PLAYER: Record<'0' | '1', number> = { '0': 2.7, '1': -2.7 };
const PAD_RADIUS = 0.5;
const HIGHLIGHT_INSET = 0.08;
const PAD_SEGMENTS = 48;

export function PlayerPedestal({ variant, playerID, piece, highlighted }: PlayerPedestalProps) {
  const { theme } = useTheme();
  const flyingReceiver = useFlightStore((s) => s.flyingReceiver);
  const z = Z_BY_PLAYER[playerID];
  // Hide the resting piece while the arcing handoff piece is in flight to this
  // pedestal — avoids a duplicate sitting at the destination mid-animation.
  const showPiece = piece !== null && flyingReceiver !== playerID;
  const baseColor = theme.colors.rackSurface;
  const highlightColor = theme.colors.selection;

  return (
    <group position={[0, 0, z]}>
      {/* Base pad. */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <circleGeometry args={[PAD_RADIUS, PAD_SEGMENTS]} />
        <meshStandardMaterial
          color={highlighted ? highlightColor : baseColor}
          roughness={0.9}
          metalness={0}
          envMapIntensity={0.2}
          emissive={highlighted ? highlightColor : '#000'}
          emissiveIntensity={highlighted ? 0.25 : 0}
        />
      </mesh>
      {/* Inner pad — gives a ring effect when highlighted. */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.015, 0]}>
        <circleGeometry args={[PAD_RADIUS - HIGHLIGHT_INSET / 2, PAD_SEGMENTS]} />
        <meshStandardMaterial
          color={baseColor}
          roughness={0.9}
          metalness={0}
          envMapIntensity={0.2}
        />
      </mesh>
      {showPiece && <PieceMesh variant={variant} piece={piece} />}
    </group>
  );
}
