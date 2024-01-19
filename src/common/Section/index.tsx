import { ComponentPropsWithoutRef } from 'react';

import styles from './styles.module.scss';

interface Props extends ComponentPropsWithoutRef<'section'> {
  heading?: string;
}
const Section = ({ heading, ...props }: Props) => {
  return (
    <section className={styles.section} {...props}>
      <h1 className={styles.section__heading}>{heading}</h1>
    </section>
  );
};

export default Section;
