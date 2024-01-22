'use client';

import React from 'react';
import { motion } from 'framer-motion';

import Chip from '@/common/Chip';

import styles from './styles.module.scss';

type Company = {
  name: string;
  link: string;
};

interface Props {
  dateRange: string;
  position: string;
  company: Company;
  summary?: React.ReactNode;
  techStack?: string[];
}

const ExpCard = ({
  dateRange,
  company,
  position,
  summary,
  techStack = [],
}: Props) => {
  return (
    <motion.a
      href={company.link}
      target="_blank"
      rel="noreferrer"
      className={styles.expCard}
      whileHover={{
        scale: 1.01,
        backgroundColor: 'rgba(0, 0, 0, 0.08)',
      }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.expCard__dateRange}>{dateRange}</div>

      <div className={styles.expCard__main}>
        {!!company && (
          <h2 className={styles.expCard__company}>{company.name}</h2>
        )}
        {!!position && <h3 className={styles.expCard__position}>{position}</h3>}

        {!!summary && <p className={styles.expCard__summary}>{summary}</p>}

        {!!techStack.length && (
          <ul className={styles.expCard__techStack}>
            {techStack.map((item) => (
              <li key={item} className={styles.expCard__techStackItem}>
                <Chip label={item} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.a>
  );
};

export default ExpCard;
