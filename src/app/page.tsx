import Intro from '@/app/_containers/Intro';
import AppHeader from '@/components/AppHeader';

import styles from './page.module.css';

export default function Home() {
  return (
    <>
      <AppHeader fixed lightNav={false} />

      <main className={styles.main}>
        <Intro />
      </main>
    </>
  );
}
