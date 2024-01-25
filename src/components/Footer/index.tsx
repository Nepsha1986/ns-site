import Link from 'next/link';
import classNames from 'classnames';

import styles from './styles.module.scss';

interface Props {
  fixed?: boolean;
  lightNav?: boolean;
}

const Footer = ({ fixed = false }: Props) => {
  const classname = classNames(styles.footer, {
    [styles.footer_fixed]: fixed,
  });

  return (
    <footer className={classname}>
      <div className={styles.footer__container}>
        <p style={{ marginBottom: 0 }}>
          © 2024, Alex Nepsha. All Rights Reserved.
        </p>

        <Link href="/terms-and-conditions" target="_blank">
          Terms and Conditions
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
