import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';

import styles from './styles.module.scss';

const gitHubLink = 'https://github.com/Nepsha1986';
const linkedinLink = 'https://www.linkedin.com/in/alex-nepsha-851a23115/';

const SocialItem = ({
  link,
  label,
  icon,
}: {
  link: string;
  label: string;
  icon: React.ReactNode;
}) => {
  return (
    <li className={styles.socials__listItem}>
      <a
        className={styles.socials__link}
        href={link}
        target="_blank"
        aria-label={label}
      >
        {icon}
      </a>
    </li>
  );
};
const Socials = () => {
  return (
    <ul className={styles.socials}>
      <SocialItem
        link={gitHubLink}
        label="GitHub"
        icon={<FontAwesomeIcon icon={faGithub} />}
      />
      <SocialItem
        link={linkedinLink}
        label="LinkedIn"
        icon={<FontAwesomeIcon icon={faLinkedin} />}
      />
    </ul>
  );
};

export default Socials;
