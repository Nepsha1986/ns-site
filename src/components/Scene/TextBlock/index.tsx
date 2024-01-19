import React, { useEffect, useRef } from 'react';
import { animate, inView } from 'framer-motion';
import classNames from 'classnames';

import styles from './styles.module.scss';

interface Props {
  children: React.ReactNode;
  position?: 'top' | 'center' | 'bottom';
  align?: 'left' | 'center' | 'right';
  bordered?: boolean;
}

const TextBlock = ({
  children,
  position = 'center',
  align = 'center',
  bordered = false,
}: Props) => {
  const textRef = useRef(null);

  useEffect(() => {
    if (textRef.current) {
      inView(textRef.current, ({ target }) => {
        animate(
          target,
          { opacity: [0, 1], y: ['40px', '0px'] },
          { duration: 1, delay: 0.5 },
        );
      });
    }
  }, []);

  const elClass = classNames(styles.textBlock, {
    [styles[`textBlock_${position}`]]: true,
    [styles[`textBlock_${align}Aligned`]]: true,
    [styles.textBlock_bordered]: bordered,
  });

  return (
    <div className={elClass} ref={textRef}>
      {children}
    </div>
  );
};

export default TextBlock;
