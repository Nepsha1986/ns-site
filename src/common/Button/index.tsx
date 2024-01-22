import { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import classNames from 'classnames';

import styles from './styles.module.scss';

interface Props extends HTMLMotionProps<'button'> {
  children: ReactNode;
  color?: 'dark' | 'light' | 'transparent';
  size?: 'sm' | 'md' | 'lg';
}
const Button = ({ children, color = 'dark', size = 'sm', ...rest }: Props) => {
  const classname = classNames(styles.button, {
    [styles[`button_${color}`]]: !!color,
    [styles[`button_${size}`]]: !!size,
  });

  return (
    <motion.button
      className={classname}
      {...rest}
      whileTap={{
        scale: 1.1,
      }}
      whileHover={{
        scale: 1.03,
      }}
    >
      {children}
    </motion.button>
  );
};

export default Button;
