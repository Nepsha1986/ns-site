'use client';

import React, {
  ComponentPropsWithoutRef,
  useContext,
  useEffect,
  useRef,
} from 'react';
import { useInView } from 'framer-motion';

import HomePageContext, { HomePageSection } from '@/app/context';

import styles from './styles.module.scss';

interface Props extends ComponentPropsWithoutRef<'section'> {
  children?: React.ReactNode;
  heading?: string;
}
const Section = ({ heading, children, ...props }: Props) => {
  const ref = useRef<HTMLHeadingElement>(null);
  const { setActiveSection } = useContext(HomePageContext);

  const isInView = useInView(ref, {
    amount: 1,
  });

  useEffect(() => {
    if (isInView) {
      setActiveSection(props.id as HomePageSection);
    }
  }, [isInView]);

  return (
    <section className={styles.section} {...props}>
      <div className={styles.section__container}>
        <h1 className={styles.section__heading} ref={ref}>
          {heading}
        </h1>
        {children}
      </div>
    </section>
  );
};

export default Section;
