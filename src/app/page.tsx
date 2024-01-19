import Intro from '@/app/_containers/Intro';
import About from '@/app/_containers/About';

import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <Intro />
      <About />
    </main>
  );
}
