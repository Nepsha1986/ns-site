import React from 'react';
import type { Metadata } from 'next';
import { Fraunces, Lato } from 'next/font/google';

import './globals.css';

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-body',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'Personal website of Alex Nepsha',
  description:
    'Specializing in diverse web technologies, I transform design mockups into responsive websites, optimize site performance, and deliver high-quality code.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lato.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  );
}
