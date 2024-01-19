import { ReactNode } from 'react';

import styles from './styles.module.scss';
import { motion, HTMLMotionProps } from 'framer-motion';
import classNames from 'classnames';

interface Props extends HTMLMotionProps<'button'> {
  children: ReactNode;
  color?: 'dark' | 'light';
}
const Button = ({ children, color = 'dark', ...rest }: Props) => {
  const classname = classNames(styles.button, {
    [styles[`button_${color}`]]: !!color,
  });

  return (
    <motion.button
      className={classname}
      {...rest}
      whileTap={{
        scale: 1.1,
      }}
    >
      {children}
    </motion.button>
  );
};

export default Button;
