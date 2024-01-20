import Navigation from './components/Navigation';
import AboutInfo from './components/AboutInfo';
import Socials from './components/Socials';

import styles from './styles.module.scss';

const SiteHeader = () => {
  return (
    <div className={styles.header}>
      <div className={styles.header__container}>
        <AboutInfo />
        <Navigation />
        <Socials />
      </div>
    </div>
  );
};

export default SiteHeader;
