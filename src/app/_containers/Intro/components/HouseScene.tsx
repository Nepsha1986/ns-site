'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  Euler,
  MathUtils,
  Matrix4,
  PerspectiveCamera,
  Quaternion,
  Vector3,
  type Group,
} from 'three';

import type { Hotspot } from '../hotspots';

type Vec3 = [number, number, number];

interface CameraPreset {
  position: Vec3;
  fov: number;
  // Extra camera rotation while focused on a hotspot, so the object sits
  // next to the preview card instead of under it.
  focusFraming: { pitch: number; yaw: number };
  // Narrow viewports need the camera further away to fit the object.
  focusDistanceScale: number;
}

// Landscape keeps the original desktop composition, portrait pulls the camera
// back and centers the house above the collapsed info card.
const CAMERA: Record<'landscape' | 'portrait', CameraPreset> = {
  landscape: {
    position: [-1, 2, 5],
    fov: 75,
    focusFraming: { pitch: 0, yaw: 0.3 },
    focusDistanceScale: 1,
  },
  portrait: {
    position: [0.1, 1.2, 7],
    fov: 75,
    focusFraming: { pitch: -0.2, yaw: 0 },
    focusDistanceScale: 1.4,
  },
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

const FOCUS_SPEED = 2.5;
// Hotspots facing away from the camera beyond this are hidden.
const HOTSPOT_MIN_FACING = 0.05;

const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOutCubic = (x: number) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

const UP = new Vector3(0, 1, 0);
const IDENTITY = new Quaternion();

interface HouseSceneProps {
  url: string;
  hotspots: Hotspot[];
  hotspotEls: React.MutableRefObject<Record<string, HTMLElement | null>>;
  focusedId: string | null;
  reducedMotion: boolean;
  onReady: () => void;
  onScenePointerDown?: () => void;
}

const HouseScene = ({
  url,
  hotspots,
  hotspotEls,
  focusedId,
  reducedMotion,
  onReady,
  onScenePointerDown,
}: HouseSceneProps) => {
  const { scene } = useLoader(GLTFLoader, url);
  const group = useRef<Group>(null);
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);

  const motion = useRef({
    introTime: reducedMotion ? INTRO_DURATION : 0,
    mouse: { x: 0, y: 0 },
    lastMouseMove: -Infinity,
    parallax: { x: 0, y: 0 },
    idle: 1,
    dragPointer: null as number | null,
    dragLast: { x: 0, y: 0 },
    drag: { x: 0, y: 0 },
    focus: 0,
    focusTarget: null as Hotspot | null,
  });

  // Scratch objects reused every frame.
  const tmp = useMemo(
    () => ({
      base: new Vector3(),
      point: new Vector3(),
      normal: new Vector3(),
      toCamera: new Vector3(),
      focusPos: new Vector3(),
      projected: new Vector3(),
      lookAt: new Matrix4(),
      focusQuat: new Quaternion(),
      framing: new Quaternion(),
      euler: new Euler(),
    }),
    [],
  );

  const focusedIdRef = useRef(focusedId);
  focusedIdRef.current = focusedId;

  const onScenePointerDownRef = useRef(onScenePointerDown);
  onScenePointerDownRef.current = onScenePointerDown;

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
      const wasFocused = focusedIdRef.current !== null;
      onScenePointerDownRef.current?.();
      if (e.pointerType === 'mouse' || wasFocused) return;
      m.dragPointer = e.pointerId;
      m.dragLast = { x: e.clientX, y: e.clientY };
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
    const introDone = m.introTime >= INTRO_DURATION;

    // Keep the last target while flying back so the camera can return smoothly.
    const focused = hotspots.find((h) => h.id === focusedIdRef.current);
    if (focused) m.focusTarget = focused;
    m.focus = reducedMotion
      ? Number(!!focused)
      : MathUtils.damp(m.focus, focused ? 1 : 0, FOCUS_SPEED, dt);
    if (!focused && m.focus < 0.001) m.focusTarget = null;
    const focus = easeInOutCubic(m.focus);

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
    m.idle = MathUtils.damp(
      m.idle,
      mouseActive || dragging || reducedMotion ? 0 : 1,
      1.5,
      dt,
    );

    // Released touch drag eases back to the auto orbit.
    if (!dragging) {
      m.drag.x = MathUtils.damp(m.drag.x, 0, 1.2, dt);
      m.drag.y = MathUtils.damp(m.drag.y, 0, 1.2, dt);
    }

    let yaw =
      BASE_YAW +
      m.parallax.x * POINTER_RANGE +
      Math.sin(t * 0.3) * SWAY_YAW * m.idle +
      m.drag.x +
      INTRO_YAW * introLeft;

    let pitch =
      BASE_PITCH +
      m.parallax.y * POINTER_RANGE +
      Math.sin(t * 0.21) * SWAY_PITCH * m.idle +
      m.drag.y +
      INTRO_PITCH * introLeft;

    const target = m.focusTarget;
    if (target) {
      yaw = MathUtils.lerp(yaw, target.focus.yaw, focus);
      pitch = MathUtils.lerp(pitch, target.focus.pitch, focus);
    }

    group.current.rotation.set(pitch, yaw, 0);
    group.current.updateMatrixWorld();

    const [x, y, z] = preset.position;
    tmp.base.set(
      x + INTRO_OFFSET[0] * introLeft,
      y + INTRO_OFFSET[1] * introLeft,
      z + INTRO_OFFSET[2] * introLeft,
    );

    if (target && focus > 0) {
      // Fly along the line from the resting camera towards the hotspot and
      // turn to look at it.
      tmp.point.fromArray(target.position);
      group.current.localToWorld(tmp.point);
      tmp.focusPos
        .copy(tmp.base)
        .sub(tmp.point)
        .setLength(target.focus.distance * preset.focusDistanceScale)
        .add(tmp.point);

      tmp.lookAt.lookAt(tmp.focusPos, tmp.point, UP);
      tmp.focusQuat.setFromRotationMatrix(tmp.lookAt);
      tmp.euler.set(preset.focusFraming.pitch, preset.focusFraming.yaw, 0);
      tmp.framing.setFromEuler(tmp.euler);
      tmp.focusQuat.multiply(tmp.framing);

      camera.position.lerpVectors(tmp.base, tmp.focusPos, focus);
      camera.quaternion.slerpQuaternions(IDENTITY, tmp.focusQuat, focus);
    } else {
      camera.position.copy(tmp.base);
      camera.quaternion.identity();
    }
    camera.updateMatrixWorld();

    // Pin hotspot markers to their points on screen.
    const showMarkers = introDone && !focusedIdRef.current && m.focus < 0.05;
    for (const h of hotspots) {
      const el = hotspotEls.current[h.id];
      if (!el) continue;

      tmp.point.fromArray(h.position);
      group.current.localToWorld(tmp.point);
      tmp.normal.fromArray(h.normal).applyQuaternion(group.current.quaternion);
      tmp.toCamera.copy(camera.position).sub(tmp.point).normalize();

      tmp.projected.copy(tmp.point).project(camera);
      const sx = ((tmp.projected.x + 1) / 2) * size.width;
      const sy = ((1 - tmp.projected.y) / 2) * size.height;
      el.style.transform = `translate3d(${sx}px, ${sy}px, 0)`;

      const visible =
        showMarkers &&
        tmp.projected.z < 1 &&
        tmp.normal.dot(tmp.toCamera) > HOTSPOT_MIN_FACING;
      const state = visible ? 'visible' : 'hidden';
      if (el.dataset.state !== state) el.dataset.state = state;
    }
  });

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  );
};

export default HouseScene;
