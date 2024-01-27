'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import classNames from 'classnames';

import styles from './styles.module.scss';

const navItems: Array<{ label: string; link: string }> = [
  {
    label: 'Home',
    link: '/',
  },
  {
    label: 'About',
    link: '/about',
  },
  {
    label: 'Contacts',
    link: '/contacts',
  },
];

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
    <Link className={className} href={link} scroll={false}>
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
      {navItems.map((i) => (
        <NavItem
          key={i.label}
          label={i.label}
          link={i.link}
          light={light}
          isActive={pathname === i.link}
        />
      ))}
    </nav>
  );
};

export default Navigation;
