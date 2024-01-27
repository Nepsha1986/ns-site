'use client';

import React, { useEffect, useState } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import bg from '@/assets/bg_fallback.webp';

import AboutInfo from '@/components/AboutInfo';
import Socials from '@/components/Socials';
import Loading from '@/components/Loading';

import styles from './styles.module.scss';

const HouseModel = React.memo(() => {
  const data = useLoader(GLTFLoader, '/house.glb');
  return <primitive object={data.scene} />;
});

HouseModel.displayName = 'HouseModel';

const House = () => {
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
      <HouseModel />
    </mesh>
  );
};

const Intro = () => {
  const [isReady, setIsReady] = useState(false);

  return (
    <div className={styles.intro}>
      <Canvas
        onCreated={() => {
          setIsReady(true);
        }}
        style={{
          opacity: isReady ? 1 : 0,
          backgroundImage: `url(${bg.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        camera={{ position: [-1, 2, 5], rotation: [0, 0, 0] }}
        className={styles.canvas}
      >
        <House />
      </Canvas>

      {!isReady && (
        <div className={styles.intro__progressBar}>
          <Loading />
        </div>
      )}

      {isReady && (
        <div className={styles.intro__main}>
          <AboutInfo />
          <Socials />
        </div>
      )}
    </div>
  );
};

export default Intro;
