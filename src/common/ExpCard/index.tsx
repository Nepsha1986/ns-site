import React from 'react';

import Chip from '@/common/Chip';

import styles from './styles.module.scss';

interface Props {
  dateRange: string;
  position: string;
  company: string;
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
    <div className={styles.expCard}>
      <div className={styles.expCard__dateRange}>{dateRange}</div>

      <div className={styles.expCard__main}>
        {!!company && <h2>{company}</h2>}
        {!!position && <h3>{position}</h3>}

        {!!summary && <div className={styles.expCard__summary}>{summary}</div>}
      </div>

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
  );
};

export default ExpCard;
