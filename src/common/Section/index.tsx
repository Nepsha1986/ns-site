import React, { ComponentPropsWithoutRef } from 'react';

import Reveal from '@/common/Reveal';

import styles from './styles.module.scss';

interface Props extends ComponentPropsWithoutRef<'section'> {
  children?: React.ReactNode;
  heading?: string;
  eyebrow?: string;
  id?: string;
}
const Section = ({ heading, eyebrow, children, id, ...props }: Props) => {
  return (
    <section id={id} className={styles.section} {...props}>
      <div className={styles.section__container}>
        <Reveal>
          {!!eyebrow && <p className={styles.section__eyebrow}>{eyebrow}</p>}
          <h1 className={styles.section__heading}>{heading}</h1>
        </Reveal>
        <Reveal delay={0.1}>{children}</Reveal>
      </div>
    </section>
  );
};

export default Section;
