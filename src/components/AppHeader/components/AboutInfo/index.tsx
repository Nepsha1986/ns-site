import React from 'react';
import styles from './styles.module.scss';

const personalPageURL = 'https://gift-idea.co/en-us/about-me';
const projectSrcURL = 'https://github.com/Nepsha1986/fable';
const AboutInfo = () => {
  return (
    <div className={styles.aboutInfo}>
      <h1 className={styles.aboutInfo__heading}>
        <a href="#intro">Alex Nepsha</a>
      </h1>
      <p className={styles.aboutInfo__subHeading}>Senior Frontend Developer</p>
      <p className={styles.aboutInfo__main}>
        I build pixel-perfect, accessible products for the web and beyond.
      </p>
    </div>
  );
};

export default AboutInfo;
