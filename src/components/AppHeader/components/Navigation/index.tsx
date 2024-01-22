'use client';
import { useContext } from 'react';
import { motion } from 'framer-motion';
import classNames from 'classnames';

import HomePageContext from '@/app/context';

import styles from './styles.module.scss';

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
  const { activeSection } = useContext(HomePageContext);

  return (
    <nav className={styles.navigation}>
      <NavItem
        label="About"
        link="#about"
        isActive={activeSection === 'about'}
      />
      <NavItem
        label="Experience"
        link="#experience"
        isActive={activeSection === 'experience'}
      />
      <NavItem
        label="Contacts"
        link="#contacts"
        isActive={activeSection === 'contacts'}
      />
    </nav>
  );
};

export default Navigation;
