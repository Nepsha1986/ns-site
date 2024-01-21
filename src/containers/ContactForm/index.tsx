'use client';

import React from 'react';
import { useForm, ValidationError } from '@formspree/react';
import Button from "@/common/Button";

const FORM_ID = "mbjndrbj";
const ContactForm = () => {
	const [state, handleSubmit] = useForm(FORM_ID);

	if (state.succeeded) {
		return <p>Thanks for joining!</p>;
	}
	return (
		<form onSubmit={handleSubmit} style={{marginBottom: '2rem'}}>
			<label htmlFor="email">
				Email Address
			</label>
			<input
				id="email"
				type="email"
				name="email"
			/>
			<ValidationError
				prefix="Email"
				field="email"
				errors={state.errors}
			/>
			<label htmlFor="message">
				Your message
			</label>
			<textarea
				id="message"
				name="message"
				rows={5}
			/>
			<ValidationError
				prefix="Message"
				field="message"
				errors={state.errors}
			/>
			<Button type="submit" disabled={state.submitting}>
				Submit
			</Button>
		</form>
	);
}

export default ContactForm;