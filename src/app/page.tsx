import Intro from '@/app/_containers/Intro';

import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <Intro />
    </main>
  );
}
