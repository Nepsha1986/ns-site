import Contacts from '@/app/_containers/Contacts';
import AppHeader from '@/components/AppHeader';

export default function ContactsPage() {
  return (
    <>
      <AppHeader />

      <main>
        <Contacts />
      </main>
    </>
  );
}
