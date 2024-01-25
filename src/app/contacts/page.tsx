import Contacts from '@/app/_containers/Contacts';
import AppHeader from '@/components/AppHeader';
import Footer from '@/components/Footer';

export default function ContactsPage() {
  return (
    <>
      <AppHeader />

      <main>
        <Contacts />
      </main>

      <Footer />
    </>
  );
}
