import React, { useState } from 'react';

import Section from '@/common/Section';
import Chip from '@/common/Chip';
import { projects } from '@/app/_containers/Portfolio/projects';

const Portfolio = () => {
  return (
    <Section heading="Projects" id="projects">
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

      <table style={{ margin: '2rem 0' }}>
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
              <td>{i.year}</td>
              <td>{i.name}</td>
              <td>
                <a href={i.company.url} target="_blank">
                  {i.company.name}
                </a>
              </td>
              <td
                style={{ display: 'flex', gap: '0.3rem', flexFlow: 'row wrap' }}
              >
                {i.technologies.map((item) => (
                  <Chip key={item} label={item} />
                ))}
              </td>
              <td>
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

      <p>
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
