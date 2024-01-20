import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';

import styles from './styles.module.scss';

const SocialItem = ({
  link,
  icon,
}: {
  link: string;
  icon: React.ReactNode;
}) => {
  return (
    <li className={styles.socials__listItem}>
      <a className={styles.socials__link} href={link}>
        {icon}
      </a>
    </li>
  );
};
const Socials = () => {
  return (
    <ul className={styles.socials}>
      <SocialItem
        link="/github-link"
        icon={<FontAwesomeIcon icon={faGithub} />}
      />
      <SocialItem
        link="/linkedin-link"
        icon={<FontAwesomeIcon icon={faLinkedin} />}
      />
    </ul>
  );
};

export default Socials;
