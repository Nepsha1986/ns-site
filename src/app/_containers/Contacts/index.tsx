import Section from '@/common/Section';
import ContactForm from '@/containers/ContactForm';

const Contacts = () => {
  return (
    <Section heading="Get in Touch">
      <p>
        {
          "Thank you for visiting my page! Whether you have a question, a suggestion, or just want to say hello, I'd love to hear from you. Feel free to reach out through the contact form below or drop me an email."
        }
      </p>

      <ContactForm />

      <p>
        You can also reach me directly via email at{' '}
        <a href="mailto:nepsha1986@gmail.com">nepsha1986@gmail.com</a>. I strive
        to respond to all inquiries within two working days, so you can expect a
        prompt reply. Looking forward to connecting with you!
      </p>
    </Section>
  );
};

export default Contacts;
