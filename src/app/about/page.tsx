import About from '@/app/_containers/About';
import Experience from '@/app/_containers/Experience';
import AppHeader from '@/components/AppHeader';

export default function AboutPage() {
  return (
    <>
      <AppHeader />

      <main>
        <About />
        <Experience />
      </main>
    </>
  );
}
