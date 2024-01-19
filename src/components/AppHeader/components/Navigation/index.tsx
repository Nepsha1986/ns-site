'use client';
import { motion } from 'framer-motion';

import styles from './styles.module.scss';

const NavItem = ({ link, label }: { link: string; label: string }) => (
  <motion.a whileTap={{ scale: 1.05 }} className={styles.navItem} href={link}>
    {label}
  </motion.a>
);
const Navigation = () => {
  return (
    <nav className={styles.navigation}>
      <NavItem label="About" link="#about" />
      <NavItem label="Experience" link="#experience" />
      <NavItem label="Contacts" link="#contacts" />
    </nav>
  );
};

export default Navigation;
