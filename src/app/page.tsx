import Intro from '@/app/_containers/Intro';
import AppHeader from '@/components/AppHeader';

export default function Home() {
  return (
    <>
      <AppHeader fixed lightNav={false} />

      <main>
        <Intro />
      </main>
    </>
  );
}
