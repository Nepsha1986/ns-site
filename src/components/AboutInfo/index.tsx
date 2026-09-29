'use client';

import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

import Icon from '@/common/Icon';
import Socials from '@/components/Socials';

import styles from './styles.module.scss';

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const AboutInfo = () => {
  return (
    <motion.div
      className={styles.aboutInfo}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      <motion.p variants={item} className={styles.aboutInfo__eyebrow}>
        <span className={styles.aboutInfo__status} /> Hi there, I&apos;m
      </motion.p>

      <motion.h1 variants={item} className={styles.aboutInfo__heading}>
        Alex <em>Nepsha</em>
      </motion.h1>

      <motion.p variants={item} className={styles.aboutInfo__subHeading}>
        Senior Frontend Developer
      </motion.p>

      <motion.div variants={item} className={styles.aboutInfo__main}>
        <p>
          I creatively transform design mockups into responsive, fast and
          user-friendly interfaces — and care about the code behind them as much
          as the pixels.
        </p>

        <p>
          I also own{' '}
          <a href="https://gift-idea.co" target="_blank">
            gift-idea.co
          </a>
          , curating and presenting unique gift ideas.
        </p>
      </motion.div>

      <motion.div variants={item} className={styles.aboutInfo__actions}>
        <Link href="/about" className={styles.aboutInfo__cta}>
          Explore my work <Icon icon={faArrowRight} />
        </Link>
        <Link
          href="/contacts"
          className={`${styles.aboutInfo__cta} ${styles.aboutInfo__cta_ghost}`}
        >
          Get in touch
        </Link>
        <Socials />
      </motion.div>
    </motion.div>
  );
};

export default AboutInfo;
