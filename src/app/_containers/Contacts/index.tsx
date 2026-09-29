import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

import Section from '@/common/Section';
import Icon from '@/common/Icon';
import Socials from '@/components/Socials';
import ContactForm from '@/containers/ContactForm';

import styles from './styles.module.scss';

const email = 'nepsha1986@gmail.com';

const Contacts = () => {
  return (
    <Section heading="Get in Touch" eyebrow="Contacts">
      <div className={styles.contacts}>
        <div>
          <p className={styles.contacts__lead}>
            Thank you for visiting my page! Whether you have a question, a
            suggestion, or just want to say hello, I&apos;d love to hear from
            you.
          </p>

          <p>
            Reach out through the form or drop me an email directly. I strive to
            respond to all inquiries within two working days.
          </p>

          <a className={styles.contacts__email} href={`mailto:${email}`}>
            <Icon className={styles.contacts__emailIcon} icon={faEnvelope} />
            {email}
          </a>

          <Socials />
        </div>

        <div className={styles.contacts__form}>
          <ContactForm />
        </div>
      </div>
    </Section>
  );
};

export default Contacts;
