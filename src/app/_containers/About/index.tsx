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
            I am a highly skilled frontend developer with a passion for crafting
            seamless and visually appealing user experiences.
          </p>

          <p>
            Experienced in diverse web technologies, I creatively transform
            design mockups into responsive websites. I specialize in optimizing
            site performance, and turning ideas into user-friendly interfaces.
            Committed to staying current with industry trends, I deliver
            high-quality code.
          </p>

          <p>
            I also own{' '}
            <a href="https://gift-idea.co/en-us/" target="_blank">
              gift-idea.co
            </a>
            , curating and presenting unique gift ideas to showcase my passion
            for creating engaging online experiences.
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
