'use client';

import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { Suspense, useMemo } from 'react';
import { BoardGrid } from '@/components/board/board-grid';
import { PieceRack } from '@/components/board/piece-rack';
import { PlayerPedestal } from '@/components/board/player-pedestal';
import { HandoffFlight } from '@/components/board/handoff-flight';
import { CameraRig, CAMERA_PRESETS } from './camera-rig';
import { useTheme } from '@/lib/theme/context';
import { useUiStore } from '@/lib/state/ui-store';
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
  const board = useMemo(() => state?.G.board ?? [], [state?.G.board]);
  const available = state?.G.available ?? [];
  const pendingPlace = state?.G.pendingPlace ?? null;
  const pendingHandoff = state?.G.pendingHandoff ?? null;
  const handedPiece = state?.G.handedPiece ?? null;
  const currentPlayer = state?.ctx.currentPlayer ?? null;
  const stage = state ? state.ctx.activePlayers?.[state.ctx.currentPlayer] : null;
  const canPlace = stage === 'place' && handedPiece !== null;
  const canPick = stage === 'pick';

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

  return (
    <Canvas
      camera={{ position: CAMERA_PRESETS.orbit.position, fov: 42 }}
      shadows
      onCreated={({ camera, scene }) => {
        const t = CAMERA_PRESETS[cameraMode].target;
        camera.lookAt(t[0], t[1], t[2]);
        scene.environmentIntensity = 0.35;
      }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={lightingPreset.ambient} />
        <directionalLight
          position={lightingPreset.directionalPosition}
          intensity={lightingPreset.directional}
          castShadow
        />
        {lightingPreset.environment && <Environment preset={lightingPreset.environment} />}
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
          cells={board}
          pendingPlace={pendingPlace}
          ghostPiece={handedPiece}
          winLine={winLine}
          canPlace={canPlace}
          onSelectCell={moves.selectCell}
          onConfirmPlace={moves.confirmPlace}
          onClearPendingPlace={moves.clearPendingPlace}
        />
        <PieceRack
          available={available}
          pendingHandoff={pendingHandoff}
          canPick={canPick}
          onSelectPiece={moves.selectHandoff}
          onConfirmHandoff={moves.confirmHandoff}
        />
        <PlayerPedestal
          playerID="0"
          piece={currentPlayer === '0' && handedPiece !== null ? handedPiece : null}
          highlighted={receiver === '0'}
        />
        <PlayerPedestal
          playerID="1"
          piece={currentPlayer === '1' && handedPiece !== null ? handedPiece : null}
          highlighted={receiver === '1'}
        />
        <HandoffFlight handedPiece={handedPiece} receiver={receiver} />
        <CameraRig mode={cameraMode} />
        <OrbitControls
          makeDefault
          enabled={cameraMode === 'orbit'}
          target={CAMERA_PRESETS.orbit.target}
          enablePan={false}
          enableZoom
          minDistance={6}
          maxDistance={14}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
        />
      </Suspense>
    </Canvas>
  );
}
