import Link from 'next/link';
import classNames from 'classnames';

import Navigation from './components/Navigation';

import styles from './styles.module.scss';

interface Props {
  fixed?: boolean;
  lightNav?: boolean;
}

const SiteHeader = ({ fixed = false, lightNav = true }: Props) => {
  const classname = classNames(styles.header, {
    [styles.header_fixed]: fixed,
    [styles.header_sticky]: !fixed,
  });

  return (
    <header className={classname}>
      <div className={styles.header__container}>
        <Link href="/" className={styles.header__logo} aria-label="Home">
          AN<span>.</span>
        </Link>

        <div className={styles.header__nav}>
          <Navigation light={lightNav} />
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
