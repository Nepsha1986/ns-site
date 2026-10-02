'use client';

import React, { useEffect, useRef } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MathUtils, PerspectiveCamera, type Group } from 'three';

type Vec3 = [number, number, number];

interface CameraPreset {
  position: Vec3;
  fov: number;
}

// Landscape keeps the original desktop composition, portrait pulls the camera
// back and centers the house above the collapsed info card.
const CAMERA: Record<'landscape' | 'portrait', CameraPreset> = {
  landscape: { position: [-1, 2, 5], fov: 75 },
  portrait: { position: [0.1, 1.2, 7], fov: 75 },
};

const BASE_PITCH = 0.15;
const BASE_YAW = 0.59;

const INTRO_DURATION = 2.8;
// Caps per-frame intro progress so a first-frame shader compile hitch
// doesn't skip the fly-in.
const INTRO_MAX_STEP = 1 / 30;
const INTRO_YAW = -1.1;
const INTRO_PITCH = 0.35;
const INTRO_OFFSET: Vec3 = [0, 2.5, 6];

const POINTER_RANGE = 0.12;
const MOUSE_IDLE_MS = 2500;

const SWAY_YAW = 0.22;
const SWAY_PITCH = 0.04;

const DRAG_SPEED = 0.005;
const DRAG_YAW_LIMIT = 0.7;
const DRAG_PITCH_MIN = -0.15;
const DRAG_PITCH_MAX = 0.2;

const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);

interface HouseSceneProps {
  url: string;
  onReady: () => void;
  onTouchStart?: () => void;
}

const HouseScene = ({ url, onReady, onTouchStart }: HouseSceneProps) => {
  const { scene } = useLoader(GLTFLoader, url);
  const group = useRef<Group>(null);
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);

  const motion = useRef({
    introTime: 0,
    mouse: { x: 0, y: 0 },
    lastMouseMove: -Infinity,
    parallax: { x: 0, y: 0 },
    idle: 1,
    dragPointer: null as number | null,
    dragLast: { x: 0, y: 0 },
    drag: { x: 0, y: 0 },
  });

  const onTouchStartRef = useRef(onTouchStart);
  onTouchStartRef.current = onTouchStart;

  const preset = size.width < size.height ? CAMERA.portrait : CAMERA.landscape;

  useEffect(() => {
    onReady();
  }, [onReady]);

  useEffect(() => {
    if (camera instanceof PerspectiveCamera && camera.fov !== preset.fov) {
      camera.fov = preset.fov;
      camera.updateProjectionMatrix();
    }
  }, [camera, preset]);

  useEffect(() => {
    const el = gl.domElement;
    const m = motion.current;

    const handleMouseMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      m.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      m.mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
      m.lastMouseMove = performance.now();
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return;
      m.dragPointer = e.pointerId;
      m.dragLast = { x: e.clientX, y: e.clientY };
      onTouchStartRef.current?.();
    };

    const handleDragMove = (e: PointerEvent) => {
      if (e.pointerId !== m.dragPointer) return;
      const dx = e.clientX - m.dragLast.x;
      const dy = e.clientY - m.dragLast.y;
      m.dragLast = { x: e.clientX, y: e.clientY };
      m.drag.x = MathUtils.clamp(
        m.drag.x + dx * DRAG_SPEED,
        -DRAG_YAW_LIMIT,
        DRAG_YAW_LIMIT,
      );
      m.drag.y = MathUtils.clamp(
        m.drag.y + dy * DRAG_SPEED,
        DRAG_PITCH_MIN,
        DRAG_PITCH_MAX,
      );
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (e.pointerId === m.dragPointer) m.dragPointer = null;
    };

    document.addEventListener('pointermove', handleMouseMove);
    el.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handleDragMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      document.removeEventListener('pointermove', handleMouseMove);
      el.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handleDragMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [gl]);

  useFrame((state, delta) => {
    if (!group.current) return;

    const m = motion.current;
    const dt = Math.min(delta, 0.1);
    const t = state.clock.elapsedTime;

    m.introTime += Math.min(delta, INTRO_MAX_STEP);
    const intro = easeOutCubic(Math.min(m.introTime / INTRO_DURATION, 1));
    const introLeft = 1 - intro;

    const dragging = m.dragPointer !== null;
    const mouseActive = performance.now() - m.lastMouseMove < MOUSE_IDLE_MS;

    // Smoothly follow the mouse; drift back to center once it stops moving.
    m.parallax.x = MathUtils.damp(
      m.parallax.x,
      mouseActive ? m.mouse.x : 0,
      3,
      dt,
    );
    m.parallax.y = MathUtils.damp(
      m.parallax.y,
      mouseActive ? m.mouse.y : 0,
      3,
      dt,
    );

    // Idle sway fades in when nobody is interacting with the scene.
    m.idle = MathUtils.damp(m.idle, mouseActive || dragging ? 0 : 1, 1.5, dt);

    // Released touch drag eases back to the auto orbit.
    if (!dragging) {
      m.drag.x = MathUtils.damp(m.drag.x, 0, 1.2, dt);
      m.drag.y = MathUtils.damp(m.drag.y, 0, 1.2, dt);
    }

    const yaw =
      BASE_YAW +
      m.parallax.x * POINTER_RANGE +
      Math.sin(t * 0.3) * SWAY_YAW * m.idle +
      m.drag.x +
      INTRO_YAW * introLeft;

    const pitch =
      BASE_PITCH +
      m.parallax.y * POINTER_RANGE +
      Math.sin(t * 0.21) * SWAY_PITCH * m.idle +
      m.drag.y +
      INTRO_PITCH * introLeft;

    group.current.rotation.set(pitch, yaw, 0);

    const [x, y, z] = preset.position;
    camera.position.set(
      x + INTRO_OFFSET[0] * introLeft,
      y + INTRO_OFFSET[1] * introLeft,
      z + INTRO_OFFSET[2] * introLeft,
    );
  });

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  );
};

export default HouseScene;
