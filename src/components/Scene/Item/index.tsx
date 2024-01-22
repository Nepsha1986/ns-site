import React, { useContext, useEffect } from 'react';
import { motion, MotionStyle, MotionValue } from 'framer-motion';

import SceneContext from '@/components/Scene/context';

import styles from './styles.module.scss';

interface Props {
  children: React.ReactNode;
  width?: string;
  height?: string;
  transformOrigin?: string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  depth?: number;
  scrollStyles?: (scrollYProgress: MotionValue) => MotionStyle;
}

const Item = ({
  children,
  width,
  height,
  transformOrigin = 'bottom center',
  top,
  bottom,
  left,
  right,
  depth,
  scrollStyles,
}: Props) => {
  const { container, scrollYProgress } = useContext(SceneContext);

  return (
    <div
      className={styles.item}
      style={{
        transformOrigin,
        width,
        height,
        right,
        top,
        bottom,
        left,
        transform: `translateZ(${depth}px)`,
      }}
    >
      {!!scrollStyles ? (
        <motion.div
          data-testid="animated_item"
          style={scrollStyles && scrollStyles(scrollYProgress)}
          viewport={{
            root: container.current,
          }}
        >
          {children}
        </motion.div>
      ) : (
        children
      )}
    </div>
  );
};

export default Item;
