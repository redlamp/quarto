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
  const desiredPos = useRef(new Vector3());

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
    },
    { dependencies: [mode, motion.cinematic, motion.reduced, camera] },
  );

  useEffect(() => {
    if (mode !== 'parallax') return;
    const canvas = gl.domElement;
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      parallaxCursor.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      parallaxCursor.current.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    canvas.addEventListener('pointermove', onMove);
    return () => canvas.removeEventListener('pointermove', onMove);
  }, [mode, gl]);

  // Per-frame: orbit the camera around the board by cursor position, then
  // lookAt. OrbitControls owns the camera in orbit mode, so skip our lookAt
  // there.
  useFrame(() => {
    if (mode === 'parallax' && !drawerOpen) {
      const theta = BASE_THETA + parallaxCursor.current.x * parallaxX * PARALLAX_ANGLE_SCALE;
      let phi = BASE_PHI - parallaxCursor.current.y * parallaxY * PARALLAX_ANGLE_SCALE;
      phi = Math.max(MIN_PHI, Math.min(MAX_PHI, phi));
      const sinPhi = Math.sin(phi);
      desiredPos.current.set(
        ORBIT_TARGET.x + ORBIT_RADIUS * sinPhi * Math.sin(theta),
        ORBIT_TARGET.y + ORBIT_RADIUS * Math.cos(phi),
        ORBIT_TARGET.z + ORBIT_RADIUS * sinPhi * Math.cos(theta),
      );
      camera.position.lerp(desiredPos.current, parallaxLerp);
    }
    if (mode !== 'orbit') {
      camera.lookAt(lookAtTarget.current);
    }
  });

  return null;
}
