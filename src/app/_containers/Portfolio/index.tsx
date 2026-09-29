import React, { useState } from 'react';

import Section from '@/common/Section';
import Chip from '@/common/Chip';
import { projects } from '@/app/_containers/Portfolio/projects';

import styles from './styles.module.scss';

const Portfolio = () => {
  return (
    <Section heading="Projects" eyebrow="Portfolio" id="projects">
      <p>
        The list below represents the projects I have worked on throughout my
        career. Many of them have undergone changes for various reasons,
        including both improvements and shortcomings, ranging from significant
        enhancements to complete transformations for better or worse.
      </p>

      <p>
        It&apos;s also worth noting that I&apos;ve made an effort to include
        even those projects that were unsuccessful, experimental, or minor
        open-source contributions.
      </p>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Year</th>
            <th>Project</th>
            <th>Company</th>
            <th>Technologies</th>
            <th>Link</th>
          </tr>
        </thead>

        <tbody>
          {projects.map((i) => (
            <tr key={i.name}>
              <td data-label="Year" className={styles.table__year}>
                {i.year}
              </td>
              <td data-label="Project" className={styles.table__name}>
                {i.name}
              </td>
              <td data-label="Company">
                <a href={i.company.url} target="_blank">
                  {i.company.name}
                </a>
              </td>
              <td data-label="Technologies" className={styles.table__techCell}>
                <div className={styles.table__tech}>
                  {i.technologies.map((item) => (
                    <Chip key={item} label={item} />
                  ))}
                </div>
              </td>
              <td data-label="Link">
                {i.link ? (
                  <a href={i.link.href} target="_blank">
                    {i.link.label}
                  </a>
                ) : (
                  '-'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className={styles.note}>
        <strong>
          IMPORTANT: This list should not be considered as an objective
          assessment of my skills and knowledge, but rather as a compilation of
          the technologies I have had the opportunity to work with.
        </strong>
      </p>
    </Section>
  );
};

export default Portfolio;
