'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import classNames from 'classnames';

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
    <Link className={className} href={link}>
      {label}
    </Link>
  );
};
const Navigation = () => {
  const pathname = usePathname();

  return (
    <nav className={styles.navigation}>
      <NavItem label="Home" link="/" isActive={pathname === '/'} />
      <NavItem label="About" link="/about" isActive={pathname === '/about'} />
      <NavItem
        label="Contacts"
        link="/contacts"
        isActive={pathname === '/contacts'}
      />
    </nav>
  );
};

export default Navigation;
