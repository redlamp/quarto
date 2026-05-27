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

// Parallax orbits the board on the same sphere as free orbit. The orbit center
// is the focal point; derive radius + base azimuth/polar from the orbit preset
// position relative to that focal point.
function sphericalFromFocal(focal: readonly [number, number, number]) {
  const pos = CAMERA_PRESETS.orbit.position;
  const ox = pos[0] - focal[0];
  const oy = pos[1] - focal[1];
  const oz = pos[2] - focal[2];
  const radius = Math.hypot(ox, oy, oz);
  return { radius, theta: Math.atan2(ox, oz), phi: Math.acos(oy / radius) };
}
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
  focalTarget: [number, number, number];
}

interface OrbitLike {
  update: () => void;
  target: { set: (x: number, y: number, z: number) => void };
}

export function CameraRig({ mode, focalTarget }: CameraRigProps) {
  const { camera, gl } = useThree();
  const controls = useThree((s) => s.controls) as OrbitLike | null;
  const motion = useMotion();
  const parallaxX = useUiStore((s) => s.parallaxX);
  const parallaxY = useUiStore((s) => s.parallaxY);
  const parallaxLerp = useUiStore((s) => s.parallaxLerp);
  const drawerOpen = useUiStore((s) => s.drawerOpen);
  const [fx, fy, fz] = focalTarget;
  // The focal point doubles as the parallax orbit center + lookAt target.
  const focalRef = useRef(new Vector3(fx, fy, fz));
  const lookAtTarget = useRef(new Vector3(fx, fy, fz));
  const parallaxCursor = useRef({ x: 0, y: 0 });
  // Screen point (normalized) that maps to zero cursor offset. Re-based to the
  // pointer on drag release so the follow resumes from there without a jerk.
  const cursorOrigin = useRef({ x: 0, y: 0 });
  const desiredPos = useRef(new Vector3());
  // Parallax orbit base — cursor offsets ride on top of this; dragging rewrites
  // it so the follow re-centers on wherever you let go.
  const initialSph = sphericalFromFocal(focalTarget);
  const orbitRadius = useRef(initialSph.radius);
  const baseTheta = useRef(initialSph.theta);
  const basePhi = useRef(initialSph.phi);
  const pressing = useRef(false);
  const dragging = useRef(false);
  const pointerDownAt = useRef({ x: 0, y: 0 });
  const lastPointer = useRef({ x: 0, y: 0 });

  useGSAP(
    () => {
      const preset = CAMERA_PRESETS[mode];
      const dur = motion.reduced ? 0 : motion.cinematic;
      // Orbit base is relative to the focal point (orbit center + lookAt).
      focalRef.current.set(fx, fy, fz);
      const sph = sphericalFromFocal(focalTarget);
      orbitRadius.current = sph.radius;
      baseTheta.current = sph.theta;
      basePhi.current = sph.phi;
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
          x: fx,
          y: fy,
          z: fz,
          duration: dur,
          ease: 'power2.inOut',
          overwrite: 'auto',
        });
      } else {
        camera.position.set(...preset.position);
        lookAtTarget.current.set(fx, fy, fz);
      }
      // Re-enter parallax with the cursor measured from center.
      if (mode === 'parallax') {
        parallaxCursor.current.x = 0;
        parallaxCursor.current.y = 0;
        cursorOrigin.current.x = 0;
        cursorOrigin.current.y = 0;
      }
    },
    { dependencies: [mode, fx, fy, fz, motion.cinematic, motion.reduced, camera] },
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

  // Double-click returns the camera to the default player framing.
  useEffect(() => {
    if (mode !== 'orbit' && mode !== 'parallax') return;
    const canvas = gl.domElement;
    const onDbl = () => {
      if (useUiStore.getState().drawerOpen) return;
      if (mode === 'parallax') {
        // Reset the orbit base + cursor; the per-frame follow eases home.
        const sph = sphericalFromFocal(focalTarget);
        baseTheta.current = sph.theta;
        basePhi.current = sph.phi;
        orbitRadius.current = sph.radius;
        parallaxCursor.current.x = 0;
        parallaxCursor.current.y = 0;
        cursorOrigin.current.x = 0;
        cursorOrigin.current.y = 0;
        pressing.current = false;
        dragging.current = false;
        return;
      }
      // Orbit: tween position back, keeping OrbitControls in sync.
      const pos = CAMERA_PRESETS.orbit.position;
      controls?.target.set(fx, fy, fz);
      const dur = motion.reduced ? 0 : motion.cinematic;
      if (dur > 0) {
        gsap.to(camera.position, {
          x: pos[0],
          y: pos[1],
          z: pos[2],
          duration: dur,
          ease: 'power2.inOut',
          overwrite: 'auto',
          onUpdate: () => controls?.update(),
          onComplete: () => controls?.update(),
        });
      } else {
        camera.position.set(pos[0], pos[1], pos[2]);
        controls?.update();
      }
    };
    canvas.addEventListener('dblclick', onDbl);
    return () => canvas.removeEventListener('dblclick', onDbl);
  }, [mode, gl, camera, controls, fx, fy, fz, motion.reduced, motion.cinematic]);

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
      const r = orbitRadius.current;
      desiredPos.current.set(
        focalRef.current.x + r * sinPhi * Math.sin(theta),
        focalRef.current.y + r * Math.cos(phi),
        focalRef.current.z + r * sinPhi * Math.cos(theta),
      );
      camera.position.lerp(desiredPos.current, drag ? 1 : parallaxLerp);
    }
    if (mode !== 'orbit') {
      camera.lookAt(lookAtTarget.current);
    }
  });

  return null;
}
