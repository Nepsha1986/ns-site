'use client';

import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import { faArrowRight, faXmark } from '@fortawesome/free-solid-svg-icons';

import Icon from '@/common/Icon';

import type { Hotspot } from '../hotspots';
import styles from './HotspotPreview.module.scss';

const container: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
      delay: 0.35,
      staggerChildren: 0.08,
      delayChildren: 0.45,
    },
  },
  exit: { opacity: 0, y: 16, transition: { duration: 0.25 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

interface HotspotPreviewProps {
  hotspot: Hotspot;
  onClose: () => void;
}

const HotspotPreview = ({ hotspot, onClose }: HotspotPreviewProps) => {
  return (
    <motion.div
      className={styles.preview}
      variants={container}
      initial="hidden"
      animate="visible"
      exit="exit"
      role="dialog"
      aria-labelledby={`hotspot-${hotspot.id}-title`}
    >
      <button
        type="button"
        className={styles.preview__close}
        aria-label="Back to the scene"
        onClick={onClose}
      >
        <Icon icon={faXmark} />
      </button>

      <motion.p variants={item} className={styles.preview__eyebrow}>
        {hotspot.eyebrow}
      </motion.p>

      <motion.h2
        variants={item}
        id={`hotspot-${hotspot.id}-title`}
        className={styles.preview__title}
      >
        {hotspot.title}
      </motion.h2>

      <motion.p variants={item} className={styles.preview__text}>
        {hotspot.text}
      </motion.p>

      <motion.div variants={item} className={styles.preview__actions}>
        <Link href={hotspot.href} className={styles.preview__cta}>
          {hotspot.cta} <Icon icon={faArrowRight} />
        </Link>
        <button
          type="button"
          className={`${styles.preview__cta} ${styles.preview__cta_ghost}`}
          onClick={onClose}
        >
          Back
        </button>
      </motion.div>
    </motion.div>
  );
};

export default HotspotPreview;
