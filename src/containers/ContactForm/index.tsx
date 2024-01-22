'use client';

import React, { useRef } from 'react';
import { useForm, ValidationError } from '@formspree/react';
import Button from '@/common/Button';

const FORM_ID = 'mbjndrbj';
const ContactForm = () => {
  const [state, handleSubmit] = useForm(FORM_ID);
  const emailRef = useRef<HTMLInputElement>({} as HTMLInputElement);
  const messageRef = useRef<HTMLTextAreaElement>({} as HTMLTextAreaElement);

  if (state.succeeded) {
    emailRef.current.value = '';
    messageRef.current.value = '';
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
      <label htmlFor="email">Email Address</label>
      <input ref={emailRef} id="email" type="email" name="email" required />
      <ValidationError prefix="Email" field="email" errors={state.errors} />

      <label htmlFor="message">Your message</label>
      <textarea
        ref={messageRef}
        minLength={30}
        id="message"
        name="message"
        required
        rows={5}
      />
      <ValidationError prefix="Message" field="message" errors={state.errors} />
      <Button type="submit" disabled={state.submitting}>
        Submit
      </Button>

      {!!state.errors && (
        <p style={{ marginTop: '1rem', color: '#9a0505' }}>
          Something went wrong, please try again later.
        </p>
      )}

      {state.succeeded && (
        <p style={{ marginTop: '1rem', color: '#24810a' }}>
          Thank you for reaching out! Your message has been successfully sent.
        </p>
      )}
    </form>
  );
};

export default ContactForm;
