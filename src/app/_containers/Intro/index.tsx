'use client';

import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Canvas } from '@react-three/fiber';
import { AnimatePresence } from 'framer-motion';
import bg from '@/assets/bg_fallback.webp';

import AboutInfo from '@/components/AboutInfo';
import Loading from '@/components/Loading';
import useMediaQuery from '@/hooks/useMediaQuery';

import HouseScene from './components/HouseScene';
import HotspotPreview from './components/HotspotPreview';
import hotspots from './hotspots';
import styles from './styles.module.scss';

const MODEL_URL = {
  desktop: '/house.glb',
  mobile: '/house-mobile.glb',
};

const Intro = () => {
  const [isReady, setIsReady] = useState(false);
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const hotspotEls = useRef<Record<string, HTMLElement | null>>({});

  const focusedHotspot = hotspots.find((h) => h.id === focusedId);

  const handleReady = useCallback(() => setIsReady(true), []);
  const handleScenePointerDown = useCallback(() => {
    setIsInfoExpanded(false);
    setFocusedId(null);
  }, []);
  const handleClosePreview = useCallback(() => setFocusedId(null), []);

  useEffect(() => {
    if (!focusedId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFocusedId(null);
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [focusedId]);

  return (
    <div className={styles.intro}>
      {isMobile !== null && reducedMotion !== null && (
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
              hotspots={hotspots}
              hotspotEls={hotspotEls}
              focusedId={focusedId}
              reducedMotion={reducedMotion}
              onReady={handleReady}
              onScenePointerDown={handleScenePointerDown}
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
        <div className={styles.intro__hotspots}>
          {hotspots.map((h) => (
            <button
              key={h.id}
              ref={(el) => {
                hotspotEls.current[h.id] = el;
              }}
              type="button"
              className={styles.hotspot}
              data-state="hidden"
              onClick={() => {
                setIsInfoExpanded(false);
                setFocusedId(h.id);
              }}
            >
              <span className={styles.hotspot__inner}>
                <span className={styles.hotspot__dot} aria-hidden />
                <span className={styles.hotspot__label}>{h.label}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      {isReady && (
        <div className={styles.intro__main}>
          <AnimatePresence mode="wait" initial={false}>
            {focusedHotspot ? (
              <HotspotPreview
                key={focusedHotspot.id}
                hotspot={focusedHotspot}
                onClose={handleClosePreview}
              />
            ) : (
              <AboutInfo
                key="about"
                collapsible={!!isMobile}
                expanded={isInfoExpanded}
                onExpandedChange={setIsInfoExpanded}
              />
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Intro;
