'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import classNames from 'classnames';

import styles from './styles.module.scss';

const NavItem = ({
  link,
  label,
  isActive = false,
  light = true,
}: {
  link: string;
  label: string;
  isActive?: boolean;
  light?: boolean;
}) => {
  const className = classNames(styles.navItem, {
    [styles.navItem_active]: isActive,
    [styles.navItem_light]: light,
  });

  return (
    <Link className={className} href={link}>
      <span style={{ position: 'relative', zIndex: 2 }}>{label}</span>
    </Link>
  );
};

interface Props {
  light?: boolean;
}
const Navigation = ({ light = true }: Props) => {
  const pathname = usePathname();

  return (
    <nav className={styles.navigation}>
      <NavItem
        label="Home"
        link="/"
        light={light}
        isActive={pathname === '/'}
      />
      <NavItem
        label="About"
        link="/about"
        light={light}
        isActive={pathname === '/about'}
      />
      <NavItem
        light={light}
        label="Contacts"
        link="/contacts"
        isActive={pathname === '/contacts'}
      />
    </nav>
  );
};

export default Navigation;
