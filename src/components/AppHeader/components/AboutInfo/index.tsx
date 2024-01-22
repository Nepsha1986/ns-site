import styles from './styles.module.scss';

const AboutInfo = () => {
  return (
    <div className={styles.aboutInfo}>
      <h1 className={styles.aboutInfo__heading}>
        <a href="#intro">Alex Nepsha</a>
      </h1>
      <p className={styles.aboutInfo__subHeading}>Senior Frontend Developer</p>
      <p className={styles.aboutInfo__main}>
        Experienced frontend developer with a flair for crafting seamless user
        experiences.
      </p>
    </div>
  );
};

export default AboutInfo;
