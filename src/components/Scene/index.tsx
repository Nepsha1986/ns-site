'use client';
import React, { cloneElement, ElementRef, useRef, useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

import TextBlock from './TextBlock';
import Item from './Item';
import Footer from './Footer';
import Header from './Header';

import SceneContext from './context';
import styles from './styles.module.scss';

interface Props {
  children: React.ReactNode;
  background?: string;
  debug?: boolean;
  minHeight?: string;
  overflow?: string;
}
const Scene = ({
  children,
  background,
  debug,
  minHeight = '100dvh',
  overflow = 'hidden',
}: Props) => {
  const sceneRef = useRef<ElementRef<'div'>>(null);
  const [scrollPosition, setScrollPosition] = useState<number | undefined>();

  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ['start end', 'end start'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    setScrollPosition(latest);
  });

  type SceneComponentType =
    | typeof Scene.TextBlock
    | typeof Scene.Item
    | typeof Scene.Header
    | typeof Scene.Footer;

  const getComponents = (el: SceneComponentType): React.ReactNode[] =>
    React.Children.toArray(children).filter(
      (child) => (child as React.ReactElement).type === el,
    );

  const getComponent = (el: SceneComponentType): React.ReactNode =>
    React.Children.toArray(children).find(
      (child) => (child as React.ReactElement).type === el,
    );

  const Texts = getComponents(Scene.TextBlock) || null;
  const Items = getComponents(Scene.Item) || null;
  const Footer = getComponent(Scene.Footer) || null;
  const Header = getComponent(Scene.Header) || null;

  return (
    <SceneContext.Provider
      value={{ scrollYProgress, scrollPosition, container: sceneRef }}
    >
      <section
        className={styles.scene}
        ref={sceneRef}
        style={{ background, minHeight, overflow }}
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

            {debug && (
              <>
                <div className={styles.scene__roof} />
                <div className={styles.scene__floor} />
                <div className={styles.scene__wallLeft} />
                <div className={styles.scene__wallRight} />
              </>
            )}
          </motion.div>
        )}

        {Header && <header className={styles.scene__header}>{Header}</header>}

        <div className={styles.scene__content}>
          {!!Texts.length &&
            Texts.map((Child) => cloneElement(Child as React.ReactElement))}
        </div>

        {Footer && <footer className={styles.scene__footer}>{Footer}</footer>}
      </section>
    </SceneContext.Provider>
  );
};

Scene.TextBlock = TextBlock;
Scene.Item = Item;
Scene.Footer = Footer;
Scene.Header = Header;

export default Scene;
