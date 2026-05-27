'use client';

import { useGSAP } from '@gsap/react';
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { Vector3 } from 'three';
import { useMotion } from '@/lib/motion/use-motion';
import { useUiStore, type CameraMode } from '@/lib/state/ui-store';

interface CameraPreset {
  position: [number, number, number];
  target: [number, number, number];
}

export const CAMERA_PRESETS: Record<CameraMode, CameraPreset> = {
  'top-down': { position: [0, 11, 0.5], target: [0, 0, 0] },
  iso: { position: [-5, 7, 7], target: [-1, 0, 0] },
  orbit: { position: [-1.2, 7.5, 7.8], target: [-1, 0, 0] },
  // Same framing as free orbit — parallax orbits the same sphere, just driven
  // by cursor position instead of drag.
  parallax: { position: [-1.2, 7.5, 7.8], target: [-1, 0, 0] },
};

// Parallax orbits the board on the same sphere as free orbit. Derive the base
// spherical coords from the orbit preset; cursor position nudges azimuth/polar.
const ORBIT_TARGET = new Vector3(...CAMERA_PRESETS.orbit.target);
const ORBIT_OFFSET = new Vector3(...CAMERA_PRESETS.orbit.position).sub(ORBIT_TARGET);
const ORBIT_RADIUS = ORBIT_OFFSET.length();
const BASE_THETA = Math.atan2(ORBIT_OFFSET.x, ORBIT_OFFSET.z);
const BASE_PHI = Math.acos(ORBIT_OFFSET.y / ORBIT_RADIUS);
// Maps the 0–4 slider strength to a sane angular swing (radians) at cursor edge.
const PARALLAX_ANGLE_SCALE = 0.2;
// Match OrbitControls' polar limits so cursor-orbit can't dip under the board.
const MIN_PHI = Math.PI / 6;
const MAX_PHI = Math.PI / 2.2;
// Radians of orbit per pixel dragged in parallax mode.
const DRAG_SPEED = 0.005;
// Pointer must travel this far (px) after press before it counts as a drag —
// otherwise a click would pop the camera.
const DRAG_THRESHOLD = 6;

interface CameraRigProps {
  mode: CameraMode;
}

export function CameraRig({ mode }: CameraRigProps) {
  const { camera, gl } = useThree();
  const motion = useMotion();
  const parallaxX = useUiStore((s) => s.parallaxX);
  const parallaxY = useUiStore((s) => s.parallaxY);
  const parallaxLerp = useUiStore((s) => s.parallaxLerp);
  const drawerOpen = useUiStore((s) => s.drawerOpen);
  const lookAtTarget = useRef(new Vector3(...CAMERA_PRESETS[mode].target));
  const parallaxCursor = useRef({ x: 0, y: 0 });
  // Screen point (normalized) that maps to zero cursor offset. Re-based to the
  // pointer on drag release so the follow resumes from there without a jerk.
  const cursorOrigin = useRef({ x: 0, y: 0 });
  const desiredPos = useRef(new Vector3());
  // Parallax orbit base — cursor offsets ride on top of this; dragging rewrites
  // it so the follow re-centers on wherever you let go.
  const baseTheta = useRef(BASE_THETA);
  const basePhi = useRef(BASE_PHI);
  const pressing = useRef(false);
  const dragging = useRef(false);
  const pointerDownAt = useRef({ x: 0, y: 0 });
  const lastPointer = useRef({ x: 0, y: 0 });

  useGSAP(
    () => {
      const preset = CAMERA_PRESETS[mode];
      const dur = motion.reduced ? 0 : motion.cinematic;
      if (dur > 0) {
        gsap.to(camera.position, {
          x: preset.position[0],
          y: preset.position[1],
          z: preset.position[2],
          duration: dur,
          ease: 'power2.inOut',
          overwrite: 'auto',
        });
        gsap.to(lookAtTarget.current, {
          x: preset.target[0],
          y: preset.target[1],
          z: preset.target[2],
          duration: dur,
          ease: 'power2.inOut',
          overwrite: 'auto',
        });
      } else {
        camera.position.set(...preset.position);
        lookAtTarget.current.set(...preset.target);
      }
      // Re-enter parallax at the standard framing (cursor measured from center).
      if (mode === 'parallax') {
        baseTheta.current = BASE_THETA;
        basePhi.current = BASE_PHI;
        parallaxCursor.current.x = 0;
        parallaxCursor.current.y = 0;
        cursorOrigin.current.x = 0;
        cursorOrigin.current.y = 0;
      }
    },
    { dependencies: [mode, motion.cinematic, motion.reduced, camera] },
  );

  useEffect(() => {
    if (mode !== 'parallax') return;
    const canvas = gl.domElement;
    const onDown = (e: PointerEvent) => {
      if (useUiStore.getState().drawerOpen) return;
      pressing.current = true;
      dragging.current = false;
      pointerDownAt.current = { x: e.clientX, y: e.clientY };
    };
    const onMove = (e: PointerEvent) => {
      if (!pressing.current) {
        // Hovering — cursor drives the parallax follow, measured from the
        // current origin (re-based on the last drag release) and clamped.
        const rect = canvas.getBoundingClientRect();
        const rawX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const rawY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        parallaxCursor.current.x = Math.max(-1, Math.min(1, rawX - cursorOrigin.current.x));
        parallaxCursor.current.y = Math.max(-1, Math.min(1, rawY - cursorOrigin.current.y));
        return;
      }
      if (!dragging.current) {
        // Pressed but not yet past the threshold — treat as a potential click,
        // hold the view steady (no pop).
        const dx0 = e.clientX - pointerDownAt.current.x;
        const dy0 = e.clientY - pointerDownAt.current.y;
        if (dx0 * dx0 + dy0 * dy0 < DRAG_THRESHOLD * DRAG_THRESHOLD) return;
        // Drag begins: fold the current cursor offset into the base so the
        // camera doesn't jump, then zero the cursor.
        const { parallaxX: px, parallaxY: py } = useUiStore.getState();
        baseTheta.current += parallaxCursor.current.x * px * PARALLAX_ANGLE_SCALE;
        basePhi.current = Math.max(
          MIN_PHI,
          Math.min(MAX_PHI, basePhi.current - parallaxCursor.current.y * py * PARALLAX_ANGLE_SCALE),
        );
        parallaxCursor.current.x = 0;
        parallaxCursor.current.y = 0;
        dragging.current = true;
        lastPointer.current = { x: e.clientX, y: e.clientY };
        return;
      }
      // Dragging: pan azimuth/polar by the pointer delta.
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      lastPointer.current = { x: e.clientX, y: e.clientY };
      baseTheta.current -= dx * DRAG_SPEED;
      basePhi.current = Math.max(MIN_PHI, Math.min(MAX_PHI, basePhi.current - dy * DRAG_SPEED));
    };
    const onUp = (e: PointerEvent) => {
      // After a real drag, re-base the cursor origin to the release point so the
      // parallax follow continues smoothly instead of snapping to the absolute
      // mouse position.
      if (dragging.current) {
        const rect = canvas.getBoundingClientRect();
        cursorOrigin.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        cursorOrigin.current.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        parallaxCursor.current.x = 0;
        parallaxCursor.current.y = 0;
      }
      pressing.current = false;
      dragging.current = false;
    };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [mode, gl]);

  // Per-frame: orbit the camera around the board by cursor position, then
  // lookAt. OrbitControls owns the camera in orbit mode, so skip our lookAt
  // there.
  useFrame(() => {
    if (mode === 'parallax' && !drawerOpen) {
      const drag = dragging.current;
      // While dragging, the camera tracks the drag (base only); on release the
      // cursor offset rides on top of the new base.
      const theta =
        baseTheta.current +
        (drag ? 0 : parallaxCursor.current.x * parallaxX * PARALLAX_ANGLE_SCALE);
      let phi =
        basePhi.current - (drag ? 0 : parallaxCursor.current.y * parallaxY * PARALLAX_ANGLE_SCALE);
      phi = Math.max(MIN_PHI, Math.min(MAX_PHI, phi));
      const sinPhi = Math.sin(phi);
      desiredPos.current.set(
        ORBIT_TARGET.x + ORBIT_RADIUS * sinPhi * Math.sin(theta),
        ORBIT_TARGET.y + ORBIT_RADIUS * Math.cos(phi),
        ORBIT_TARGET.z + ORBIT_RADIUS * sinPhi * Math.cos(theta),
      );
      camera.position.lerp(desiredPos.current, drag ? 1 : parallaxLerp);
    }
    if (mode !== 'orbit') {
      camera.lookAt(lookAtTarget.current);
    }
  });

  return null;
}
