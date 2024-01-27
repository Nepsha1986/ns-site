import AppHeader from '@/components/AppHeader';
import Footer from '@/components/Footer';

import styles from './layout.module.scss';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layout}>
      <AppHeader />

      <div className={styles.layout__main}>{children}</div>

      <div className={styles.layout__footer}>
        <Footer />
      </div>
    </div>
  );
}
