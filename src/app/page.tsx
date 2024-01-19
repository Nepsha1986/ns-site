import Intro from '@/app/_containers/Intro';
import About from '@/app/_containers/About';
import Experience from '@/app/_containers/Experience';
import Contacts from '@/app/_containers/Contacts';

import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <Intro />
      <About />
      <Experience />
      <Contacts />
    </main>
  );
}
