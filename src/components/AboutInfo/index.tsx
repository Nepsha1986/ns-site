import styles from './styles.module.scss';

const AboutInfo = () => {
  return (
    <div className={styles.aboutInfo}>
      <h1 className={styles.aboutInfo__heading}>Alex Nepsha</h1>
      <p className={styles.aboutInfo__subHeading}>Senior Frontend Developer</p>
      <div className={styles.aboutInfo__main}>
        <p>
          Experienced in diverse web technologies, I creatively transform design
          mockups into responsive websites. I specialize in optimizing site
          performance, and turning ideas into user-friendly interfaces.
          Committed to staying current with industry trends, I deliver
          high-quality code.
        </p>

        <p>
          I also own{' '}
          <a href="https://gift-idea.co" target="_blank">
            gift-idea.co
          </a>
          , curating and presenting unique gift ideas to showcase my passion for
          creating engaging online experiences.
        </p>
      </div>
    </div>
  );
};

export default AboutInfo;
