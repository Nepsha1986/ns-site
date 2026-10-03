'use client';

import Link from 'next/link';
import classNames from 'classnames';
import {
  AnimatePresence,
  motion,
  type PanInfo,
  type Variants,
} from 'framer-motion';
import { faArrowRight, faChevronUp } from '@fortawesome/free-solid-svg-icons';

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

const collapse: Variants = {
  hidden: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  visible: {
    height: 'auto',
    opacity: 1,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.08,
    },
  },
};

const SWIPE_THRESHOLD = 30;
const BODY_ID = 'about-info-body';

interface AboutInfoProps {
  collapsible?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

const AboutInfo = ({
  collapsible = false,
  expanded = false,
  onExpandedChange,
}: AboutInfoProps) => {
  const isOpen = !collapsible || expanded;

  const toggle = () => onExpandedChange?.(!expanded);

  const handlePanEnd = (_: PointerEvent, info: PanInfo) => {
    if (info.offset.y < -SWIPE_THRESHOLD) onExpandedChange?.(true);
    if (info.offset.y > SWIPE_THRESHOLD) onExpandedChange?.(false);
  };

  return (
    <motion.div
      className={classNames(styles.aboutInfo, {
        [styles.aboutInfo_collapsible]: collapsible,
      })}
      variants={container}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: 16, transition: { duration: 0.25 } }}
      onPanEnd={collapsible ? handlePanEnd : undefined}
    >
      {collapsible && <span className={styles.aboutInfo__handle} aria-hidden />}

      <div
        className={styles.aboutInfo__header}
        onClick={collapsible ? toggle : undefined}
      >
        <div>
          <motion.p variants={item} className={styles.aboutInfo__eyebrow}>
            Hi there, I&apos;m
          </motion.p>

          <motion.h1 variants={item} className={styles.aboutInfo__heading}>
            Alex Nepsha
          </motion.h1>

          <motion.p variants={item} className={styles.aboutInfo__subHeading}>
            Senior Frontend Engineer
          </motion.p>
        </div>

        {collapsible && (
          <motion.button
            variants={item}
            type="button"
            className={classNames(styles.aboutInfo__toggle, {
              [styles.aboutInfo__toggle_open]: expanded,
            })}
            aria-expanded={expanded}
            aria-controls={BODY_ID}
            aria-label={expanded ? 'Hide details' : 'Show details'}
            onClick={(e) => {
              e.stopPropagation();
              toggle();
            }}
          >
            <Icon icon={faChevronUp} />
          </motion.button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="body"
            id={BODY_ID}
            className={styles.aboutInfo__body}
            variants={collapsible ? collapse : undefined}
            initial={collapsible ? 'hidden' : undefined}
            animate={collapsible ? 'visible' : undefined}
            exit={collapsible ? 'hidden' : undefined}
          >
            <motion.div variants={item} className={styles.aboutInfo__main}>
              <p>
                I creatively transform design mockups into responsive, fast and
                user-friendly interfaces — and care about the code behind them
                as much as the pixels.
              </p>

              <p>
                I also own{' '}
                <a href="https://gift-idea.co" target="_blank">
                  gift-idea.co
                </a>
                , curating and presenting unique gift ideas, and{' '}
                <a href="https://aquajoy.club" target="_blank">
                  aquajoy.club
                </a>
                , a resource for aquarium hobbyists.
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
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AboutInfo;
