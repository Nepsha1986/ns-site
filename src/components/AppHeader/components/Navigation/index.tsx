'use client';
import { motion } from 'framer-motion';

import styles from './styles.module.scss';
import classNames from 'classnames';

const NavItem = ({
  link,
  label,
  isActive = false,
}: {
  link: string;
  label: string;
  isActive?: boolean;
}) => {
  const className = classNames(styles.navItem, {
    [styles.navItem_active]: isActive,
  });

  return (
    <motion.a whileTap={{ scale: 1.05 }} className={className} href={link}>
      {label}
    </motion.a>
  );
};
const Navigation = () => {
  return (
    <nav className={styles.navigation}>
      <NavItem label="About" link="#about" isActive />
      <NavItem label="Experience" link="#experience" />
      <NavItem label="Contacts" link="#contacts" />
    </nav>
  );
};

export default Navigation;
