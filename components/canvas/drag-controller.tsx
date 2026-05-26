'use client';

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Plane, Raycaster, Vector2, Vector3 } from 'three';
import { useDragStore, type CursorWorld } from '@/lib/state/drag-store';
import { RACK_BOUNDS } from '@/components/board/piece-rack';
import type { Piece } from '@/lib/game/pieces';

interface DragControllerProps {
  cellPitch: number;
  cells: readonly (Piece | null)[];
  onCommitPlace: (idx: number) => void;
  onCommitPickHandoff: (piece: Piece) => void;
  onClickPick: (piece: Piece) => void;
}

const GROUND_PLANE = new Plane(new Vector3(0, 1, 0), 0);
const CLICK_MAX_MS = 400;
const CLICK_MAX_PX = 8;

function isOverBoardCell(x: number, z: number, pitch: number): number | null {
  const col = Math.round(x / pitch + 1.5);
  const row = Math.round(z / pitch + 1.5);
  if (col < 0 || col > 3 || row < 0 || row > 3) return null;
  const cx = (col - 1.5) * pitch;
  const cz = (row - 1.5) * pitch;
  const dx = x - cx;
  const dz = z - cz;
  const half = pitch / 2;
  if (Math.abs(dx) > half || Math.abs(dz) > half) return null;
  return row * 4 + col;
}

function isOutsideRack(cursor: CursorWorld): boolean {
  const dx = Math.abs(cursor.x - RACK_BOUNDS.centerX);
  const dz = Math.abs(cursor.z - RACK_BOUNDS.centerZ);
  return dx > RACK_BOUNDS.halfX || dz > RACK_BOUNDS.halfZ;
}

export function DragController({
  cellPitch,
  cells,
  onCommitPlace,
  onCommitPickHandoff,
  onClickPick,
}: DragControllerProps) {
  const { camera, gl } = useThree();
  const dragActive = useDragStore((s) => s.active);
  const setCursor = useDragStore((s) => s.setCursor);
  const endDrag = useDragStore((s) => s.end);

  useEffect(() => {
    if (!dragActive) return;
    const canvas = gl.domElement;
    const raycaster = new Raycaster();
    const ndc = new Vector2();
    const target = new Vector3();

    function project(e: PointerEvent): CursorWorld | null {
      const rect = canvas.getBoundingClientRect();
      ndc.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -(((e.clientY - rect.top) / rect.height) * 2 - 1),
      );
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.ray.intersectPlane(GROUND_PLANE, target);
      if (!hit) return null;
      return { x: target.x, z: target.z };
    }

    const onMove = (e: PointerEvent) => {
      const cursor = project(e);
      if (cursor) setCursor(cursor);
    };

    const onUp = (e: PointerEvent) => {
      const { piece, kind, hasMoved, pressAt, pressScreen } = useDragStore.getState();

      // Click detection: short press + minimal screen movement.
      let isClick = false;
      if (pressScreen && pressAt > 0) {
        const dt = Date.now() - pressAt;
        const dx = e.clientX - pressScreen.x;
        const dy = e.clientY - pressScreen.y;
        const px2 = dx * dx + dy * dy;
        isClick = dt < CLICK_MAX_MS && px2 < CLICK_MAX_PX * CLICK_MAX_PX;
      }

      const cursor = project(e);

      if (piece !== null) {
        if (isClick) {
          if (kind === 'pick') onClickPick(piece);
          // place kind: clicking the pedestal piece has no UI target — no-op.
        } else if (cursor) {
          if (kind === 'place') {
            const cellIdx = isOverBoardCell(cursor.x, cursor.z, cellPitch);
            if (cellIdx !== null && cells[cellIdx] === null) {
              onCommitPlace(cellIdx);
            }
          } else if (kind === 'pick' && hasMoved && isOutsideRack(cursor)) {
            onCommitPickHandoff(piece);
          }
        }
      }
      endDrag();
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [
    dragActive,
    camera,
    gl,
    setCursor,
    endDrag,
    cellPitch,
    cells,
    onCommitPlace,
    onCommitPickHandoff,
    onClickPick,
  ]);

  return null;
}
