'use client';

import { PieceMesh } from '@/components/pieces/piece-mesh';
import { useTheme } from '@/lib/theme/context';
import type { Piece } from '@/lib/game/pieces';

interface HandedPiecePedestalProps {
  piece: Piece | null;
  ownerPlayerID: string | null;
}

// P0 is "front" of the board (+z, closer to default camera);
// P1 is "back" (-z). The handed piece sits between the board edge and the
// owning player so it's visually obvious whose piece is in play.
const FRONT_Z = 2.7;
const BACK_Z = -2.7;
const PAD_SIZE = 0.95;

export function HandedPiecePedestal({ piece, ownerPlayerID }: HandedPiecePedestalProps) {
  const { theme } = useTheme();
  if (piece === null || ownerPlayerID === null) return null;
  const z = ownerPlayerID === '0' ? FRONT_Z : BACK_Z;
  return (
    <group position={[0, 0, z]}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[PAD_SIZE, PAD_SIZE]} />
        <meshStandardMaterial
          color={theme.colors.rackSurface}
          roughness={0.9}
          metalness={0}
          envMapIntensity={0.2}
        />
      </mesh>
      <PieceMesh piece={piece} />
    </group>
  );
}
