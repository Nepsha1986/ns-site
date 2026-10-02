'use client';

import React, { Suspense, useCallback, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import bg from '@/assets/bg_fallback.webp';

import AboutInfo from '@/components/AboutInfo';
import Loading from '@/components/Loading';
import useMediaQuery from '@/hooks/useMediaQuery';

import HouseScene from './components/HouseScene';
import styles from './styles.module.scss';

const MODEL_URL = {
  desktop: '/house.glb',
  mobile: '/house-mobile.glb',
};

const Intro = () => {
  const [isReady, setIsReady] = useState(false);
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleReady = useCallback(() => setIsReady(true), []);
  const handleSceneTouch = useCallback(() => setIsInfoExpanded(false), []);

  return (
    <div className={styles.intro}>
      {isMobile !== null && (
        <Canvas
          dpr={[1, 2]}
          style={{
            opacity: isReady ? 1 : 0,
            backgroundImage: `url(${bg.src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          camera={{ position: [-1, 2, 5], rotation: [0, 0, 0] }}
          className={styles.canvas}
        >
          <Suspense fallback={null}>
            <HouseScene
              url={isMobile ? MODEL_URL.mobile : MODEL_URL.desktop}
              onReady={handleReady}
              onTouchStart={handleSceneTouch}
            />
          </Suspense>
        </Canvas>
      )}

      {!isReady && (
        <div className={styles.intro__progressBar}>
          <Loading />
        </div>
      )}

      <div className={styles.intro__overlay} aria-hidden />

      {isReady && (
        <div className={styles.intro__main}>
          <AboutInfo
            collapsible={!!isMobile}
            expanded={isInfoExpanded}
            onExpandedChange={setIsInfoExpanded}
          />
        </div>
      )}
    </div>
  );
};

export default Intro;
