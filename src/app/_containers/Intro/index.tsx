'use client';

import React, { useEffect, useState } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import AboutInfo from '@/components/AppHeader/components/AboutInfo';
import Socials from '@/components/AppHeader/components/Socials';

import styles from './styles.module.scss';

const House = () => {
  const { scene } = useLoader(GLTFLoader, '/house.glb');
  const [angleX, setXAngle] = useState(0.5);
  const [angleY, setYAngle] = useState(0);

  useEffect(() => {
    const trackMove = (e: MouseEvent) => {
      setXAngle(e.x / 8000 + 0.5);
      setYAngle(e.y / 3000);
    };
    document.addEventListener('mousemove', trackMove);

    return () => {
      document.removeEventListener('mousemove', trackMove);
    };
  }, []);

  return (
    <mesh rotation={[angleY, angleX, 0]}>
      <primitive object={scene} />
    </mesh>
  );
};

const Intro = () => {
  return (
    <div className={styles.intro}>
      <Canvas
        camera={{ position: [-1, 2, 5], rotation: [0, 0, 0] }}
        style={{ height: '100dvh' }}
      >
        <ambientLight intensity={1} />
        <House />
      </Canvas>

      <div className={styles.intro__main}>
        <AboutInfo />
        <Socials />
      </div>
    </div>
  );
};

export default Intro;
