import type { Metadata } from 'next';

import NinjaGame from '@/app/_containers/NinjaGame';

export const metadata: Metadata = {
  title: 'Ninja Hunt — a tiny clicker game',
  description:
    'Guide a ninja across an isometric arena and hunt slimes, shadow bats and oni.',
};

export default function GamePage() {
  return (
    <main>
      <NinjaGame />
    </main>
  );
}
