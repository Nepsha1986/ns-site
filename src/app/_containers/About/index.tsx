import Section from '@/common/Section';
import { projects } from '@/app/_containers/Portfolio/projects';
import experience from '@/app/_containers/Experience/experience';

import styles from './styles.module.scss';

const stats = [
  { value: '2015', label: 'Building for the web since' },
  { value: projects.length, label: 'Projects in the portfolio' },
  { value: experience.length, label: 'Companies & roles' },
];

const About = () => {
  return (
    <Section heading="Summary" eyebrow="About me">
      <div className={styles.about}>
        <div className={styles.about__text}>
          <p className={styles.about__lead}>
            Senior Frontend Engineer with 10+ years of hands-on experience
            shipping user-facing products in fintech, e-commerce, and SaaS.
          </p>

          <p>
            My core strengths are React, TypeScript, and modular frontend
            architectures. I have built merchant-facing payment platforms
            processing real-time financial operations, reusable UI libraries
            adopted across multiple products, and onboarding systems
            integrating third-party partners.
          </p>

          <p>
            I also own{' '}
            <a href="https://gift-idea.co/en-us/" target="_blank">
              gift-idea.co
            </a>
            , curating and presenting unique gift ideas, and{' '}
            <a href="https://aquajoy.club" target="_blank">
              aquajoy.club
            </a>
            , a resource for aquarium hobbyists.
          </p>
        </div>

        <ul className={styles.about__stats}>
          {stats.map((i) => (
            <li key={i.label} className={styles.about__stat}>
              <span className={styles.about__statValue}>{i.value}</span>
              <span className={styles.about__statLabel}>{i.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
};

export default About;
