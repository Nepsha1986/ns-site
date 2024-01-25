import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';

import styles from './styles.module.scss';

const gitHubLink = 'https://github.com/Nepsha1986';
const linkedinLink = 'https://www.linkedin.com/in/alex-nepsha-851a23115/';

const SocialItem = ({
  link,
  icon,
}: {
  link: string;
  icon: React.ReactNode;
}) => {
  return (
    <li className={styles.socials__listItem}>
      <a className={styles.socials__link} href={link} target="_blank">
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
        icon={<FontAwesomeIcon icon={faGithub} />}
      />
      <SocialItem
        link={linkedinLink}
        icon={<FontAwesomeIcon icon={faLinkedin} />}
      />
    </ul>
  );
};

export default Socials;
