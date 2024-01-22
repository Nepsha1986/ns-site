import Navigation from './components/Navigation';
import AboutInfo from './components/AboutInfo';
import Socials from './components/Socials';

import styles from './styles.module.scss';

const SiteHeader = () => {
  return (
    <div className={styles.header}>
      <div className={styles.header__container}>
        <AboutInfo />

        <div className={styles.header__nav}>
          <Navigation />
        </div>

        <div className={styles.header__socials}>
          <Socials />
        </div>
      </div>
    </div>
  );
};

export default SiteHeader;
