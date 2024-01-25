import Navigation from './components/Navigation';
import classNames from 'classnames';

import styles from './styles.module.scss';

interface Props {
  fixed?: boolean;
  lightNav?: boolean;
}

const SiteHeader = ({ fixed = false, lightNav = true }: Props) => {
  const classname = classNames(styles.header, {
    [styles.header_fixed]: fixed,
  });

  return (
    <header className={classname}>
      <div className={styles.header__container}>
        <div className={styles.header__nav}>
          <Navigation light={lightNav} />
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
