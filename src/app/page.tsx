'use client';

import { useState } from 'react';

import Intro from '@/app/_containers/Intro';
import About from '@/app/_containers/About';
import Experience from '@/app/_containers/Experience';
import Contacts from '@/app/_containers/Contacts';
import AppHeader from '@/components/AppHeader';
import HomePageContext, { HomePageSection } from '@/app/context';

import styles from './page.module.css';

export default function Home() {
  const [activeSection, setActiveSection] = useState<HomePageSection>('about');

  return (
    <HomePageContext.Provider
      value={{
        activeSection,
        setActiveSection,
      }}
    >
      <AppHeader />

      <main className={styles.main}>
        <Intro />
        <About />
        <Experience />
        <Contacts />
      </main>
    </HomePageContext.Provider>
  );
}
