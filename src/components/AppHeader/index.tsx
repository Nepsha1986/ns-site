import Navigation from '@/components/AppHeader/components/Navigation';
import AboutInfo from '@/components/AppHeader/components/AboutInfo';

import styles from './styles.module.scss';

const SiteHeader = () => {
  return (
    <div className={styles.header}>
      <div className={styles.header__container}>
        <AboutInfo />
        <Navigation />
      </div>
    </div>
  );
};

export default SiteHeader;
