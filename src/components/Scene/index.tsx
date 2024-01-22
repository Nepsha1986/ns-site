'use client';
import React, { cloneElement, ElementRef, useRef, useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

import Item from './Item';

import SceneContext from './context';
import styles from './styles.module.scss';

interface Props {
  children: React.ReactNode;
  background?: string;
  minHeight?: string;
  overflow?: string;
}
const Scene = ({ children, background, overflow = 'hidden' }: Props) => {
  const sceneRef = useRef<ElementRef<'div'>>(null);
  const [scrollPosition, setScrollPosition] = useState<number | undefined>();

  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ['start end', 'end start'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    setScrollPosition(latest);
  });

  type SceneComponentType = typeof Scene.Item;

  const getComponents = (el: SceneComponentType): React.ReactNode[] =>
    React.Children.toArray(children).filter(
      (child) => (child as React.ReactElement).type === el,
    );

  const Items = getComponents(Scene.Item) || null;

  return (
    <SceneContext.Provider
      value={{ scrollYProgress, scrollPosition, container: sceneRef }}
    >
      <div
        className={styles.scene}
        ref={sceneRef}
        style={{ background, overflow }}
      >
        {!!scrollPosition && (
          <motion.div
            className={styles.scene__items}
            style={{
              perspectiveOrigin: `50% ${scrollPosition * 100}%`,
            }}
          >
            {!!Items.length &&
              Items.map((Child) => cloneElement(Child as React.ReactElement))}
          </motion.div>
        )}
      </div>
    </SceneContext.Provider>
  );
};

Scene.Item = Item;

export default Scene;
