import React, { ComponentPropsWithoutRef } from 'react';

import styles from './styles.module.scss';

interface Props extends ComponentPropsWithoutRef<'section'> {
  children?: React.ReactNode;
  heading?: string;
  id?: string;
}
const Section = ({ heading, children, id, ...props }: Props) => {
  return (
    <section id={id} className={styles.section} {...props}>
      <div className={styles.section__container}>
        <h1 className={styles.section__heading}>{heading}</h1>
        {children}
      </div>
    </section>
  );
};

export default Section;
