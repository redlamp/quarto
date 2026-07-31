'use client';

import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { Suspense, useCallback, useMemo } from 'react';
import { BoardGrid } from '@/components/board/board-grid';
import { PieceRack } from '@/components/board/piece-rack';
import { PlayerPedestal } from '@/components/board/player-pedestal';
import { HandoffFlight } from '@/components/board/handoff-flight';
import { PlacementFlight } from '@/components/board/placement-flight';
import { CameraRig, CAMERA_PRESETS } from './camera-rig';
import { useTheme } from '@/lib/theme/context';
import { useUiStore } from '@/lib/state/ui-store';
import { getVariant } from '@/lib/game/variants';
import type { QuartoState } from '@/lib/game/definition';
import type { Piece } from '@/lib/game/pieces';

interface ClientLike {
  G: QuartoState;
  ctx: {
    activePlayers?: Record<string, string> | null;
    currentPlayer: string;
    gameover?: unknown;
  };
}

interface BoardCanvasProps {
  state: ClientLike | null;
  moves: {
    selectCell: (cell: number) => void;
    selectHandoff: (piece: Piece) => void;
    confirmPlace: () => void;
    clearPendingPlace: () => void;
    confirmHandoff: () => void;
    clearPendingHandoff: () => void;
  };
}

export function BoardCanvas({ state, moves }: BoardCanvasProps) {
  const { lightingPreset, theme } = useTheme();
  const cameraMode = useUiStore((s) => s.cameraMode);
  const focalPoint = useUiStore((s) => s.focalPoint);
  const drawerOpen = useUiStore((s) => s.drawerOpen);
  const confirmEnabled = useUiStore((s) => s.confirmEnabled);
  const uiVariantId = useUiStore((s) => s.variantId);
  // Game state is the source of truth for which variant is on the table — the
  // store value only bridges the frame(s) before the rebuilt client reports in.
  const variant = getVariant(state?.G.variantId ?? uiVariantId);
  const board = useMemo(() => state?.G.board ?? [], [state?.G.board]);
  const available = state?.G.available ?? [];
  const pendingPlace = state?.G.pendingPlace ?? null;
  const pendingHandoff = state?.G.pendingHandoff ?? null;
  const handedPiece = state?.G.handedPiece ?? null;
  const currentPlayer = state?.ctx.currentPlayer ?? null;
  const stage = state ? state.ctx.activePlayers?.[state.ctx.currentPlayer] : null;
  const canPlace = stage === 'place' && handedPiece !== null;
  const canPick = stage === 'pick';
  const cellPitch = theme.piece.cellPitch * variant.worldScale;

  // The receiver is the player who currently holds (or is about to hold) the
  // handed piece. Pick stage → opponent is about to receive. Place stage →
  // current player is the receiver.
  const receiver: '0' | '1' | null = useMemo(() => {
    if (!currentPlayer || !stage) return null;
    if (stage === 'place') return currentPlayer as '0' | '1';
    return currentPlayer === '0' ? '1' : '0';
  }, [currentPlayer, stage]);

  const winner = state?.G.winner;
  const winLine = useMemo(() => {
    return state?.ctx.gameover && winner ? winner.line : null;
  }, [state?.ctx.gameover, winner]);

  // Confirm step off => single-click commits (skip the Give/Place button).
  const handleSelectPiece = useCallback(
    (piece: Piece) => {
      moves.selectHandoff(piece);
      if (!confirmEnabled) moves.confirmHandoff();
    },
    [moves, confirmEnabled],
  );
  const handleSelectCell = useCallback(
    (cell: number) => {
      moves.selectCell(cell);
      if (!confirmEnabled) moves.confirmPlace();
    },
    [moves, confirmEnabled],
  );

  // Camera focal point (orbit center + lookAt). 'active' biases toward the
  // current player's side of the board (P0 front +z, P1 back -z).
  const focalTarget = useMemo<[number, number, number]>(() => {
    if (focalPoint === 'board') return [0, 0, 0];
    if (focalPoint === 'active') return [-0.5, 0, currentPlayer === '1' ? -1.1 : 1.1];
    return [-1, 0, 0];
  }, [focalPoint, currentPlayer]);

  return (
    <Canvas
      camera={{ position: CAMERA_PRESETS.orbit.position, fov: 42 }}
      shadows
      onCreated={({ camera }) => {
        const t = CAMERA_PRESETS[cameraMode].target;
        camera.lookAt(t[0], t[1], t[2]);
      }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={lightingPreset.ambient} />
        {/* Soft sky/ground fill lifts the flat look without adding a harsh
            specular highlight that would glare in the glossy gems. */}
        <hemisphereLight
          intensity={0.45}
          color={theme.colors.surface}
          groundColor={theme.colors.groundSurface}
        />
        <directionalLight
          position={lightingPreset.directionalPosition}
          intensity={lightingPreset.directional}
          castShadow
        />
        {/* Intensity is declarative so drei keeps it pinned — setting it
            imperatively in onCreated got clobbered back to drei's default (1)
            whenever the Environment subtree re-applied, washing out the scene.
            Kept low so the studio HDRI's softboxes don't glare in the glossy
            gems/pieces and bounce into the camera. */}
        {lightingPreset.environment && (
          <Environment preset={lightingPreset.environment} environmentIntensity={0.22} />
        )}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
          <planeGeometry args={[24, 24]} />
          <meshStandardMaterial
            color={theme.colors.groundSurface}
            roughness={0.85}
            metalness={0}
            envMapIntensity={0.2}
          />
        </mesh>
        <BoardGrid
          variant={variant}
          cells={board}
          pendingPlace={pendingPlace}
          ghostPiece={handedPiece}
          winLine={winLine}
          canPlace={canPlace}
          handoffPending={canPick && pendingHandoff !== null}
          onSelectCell={handleSelectCell}
          onConfirmPlace={moves.confirmPlace}
          onClearPendingPlace={moves.clearPendingPlace}
          onDeselectHandoff={moves.clearPendingHandoff}
        />
        <PieceRack
          variant={variant}
          available={available}
          pendingHandoff={pendingHandoff}
          canPick={canPick}
          onSelectPiece={handleSelectPiece}
          onConfirmHandoff={moves.confirmHandoff}
          onDeselectHandoff={moves.clearPendingHandoff}
        />
        <PlayerPedestal
          variant={variant}
          playerID="0"
          piece={currentPlayer === '0' && handedPiece !== null ? handedPiece : null}
          highlighted={receiver === '0'}
        />
        <PlayerPedestal
          variant={variant}
          playerID="1"
          piece={currentPlayer === '1' && handedPiece !== null ? handedPiece : null}
          highlighted={receiver === '1'}
        />
        <HandoffFlight variant={variant} handedPiece={handedPiece} receiver={receiver} />
        <PlacementFlight
          variant={variant}
          cells={board}
          currentPlayer={currentPlayer}
          cellPitch={cellPitch}
        />
        <CameraRig mode={cameraMode} focalTarget={focalTarget} />
        <OrbitControls
          makeDefault
          enabled={(cameraMode === 'orbit' || cameraMode === 'iso') && !drawerOpen}
          target={focalTarget}
          enablePan={false}
          enableZoom
          minDistance={6}
          maxDistance={42}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
        />
      </Suspense>
    </Canvas>
  );
}
