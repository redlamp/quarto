'use client';

import { PieceMesh } from '@/components/pieces/piece-mesh';
import { useTheme } from '@/lib/theme/context';
import { useDragStore } from '@/lib/state/drag-store';
import { useHoverStore } from '@/lib/state/hover-store';
import type { Piece } from '@/lib/game/pieces';

interface HandedPiecePedestalProps {
  piece: Piece | null;
  ownerPlayerID: string | null;
  draggable: boolean;
}

// P0 is "front" of the board (+z); P1 is "back" (-z). Pedestal sits between
// board edge and the owning player.
const FRONT_Z = 2.7;
const BACK_Z = -2.7;
const PAD_SIZE = 0.95;

function zForOwner(owner: string | null): number {
  if (owner === '0') return FRONT_Z;
  if (owner === '1') return BACK_Z;
  return FRONT_Z;
}

export function HandedPiecePedestal({ piece, ownerPlayerID, draggable }: HandedPiecePedestalProps) {
  const { theme } = useTheme();
  const startDrag = useDragStore((s) => s.start);
  const dragActive = useDragStore((s) => s.active);
  const dragPiece = useDragStore((s) => s.piece);
  const dragHasMoved = useDragStore((s) => s.hasMoved);
  const setHover = useHoverStore((s) => s.set);
  const visible = piece !== null && ownerPlayerID !== null;
  const z = zForOwner(ownerPlayerID);
  // Source piece stays visible until cursor moves enough — quick taps shouldn't flicker.
  const isBeingDragged = dragActive && piece !== null && dragPiece === piece && dragHasMoved;

  if (!visible) return null;
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
      {!isBeingDragged && <PieceMesh piece={piece} />}
      {draggable && (
        <mesh
          position={[0, 0.5, 0]}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHover(piece);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setHover(null);
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            startDrag(piece, 'place', { x: 0, z }, { x: e.clientX, y: e.clientY });
          }}
        >
          <cylinderGeometry args={[0.45, 0.45, 0.9, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}
