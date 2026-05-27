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
  parallax: { position: [-3, 7.5, 7.5], target: [-1, 0, 0] },
};

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
  const parallaxBase = useRef(new Vector3(...CAMERA_PRESETS.parallax.position));

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
      parallaxBase.current.set(...CAMERA_PRESETS.parallax.position);
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

  // Per-frame: apply parallax offset + lookAt. OrbitControls owns the camera
  // in orbit mode, so skip our manual lookAt there.
  useFrame(() => {
    if (mode === 'parallax' && !drawerOpen) {
      const target = parallaxBase.current.clone();
      target.x += parallaxCursor.current.x * parallaxX;
      target.y += parallaxCursor.current.y * parallaxY;
      camera.position.lerp(target, parallaxLerp);
    }
    if (mode !== 'orbit') {
      camera.lookAt(lookAtTarget.current);
    }
  });

  return null;
}
