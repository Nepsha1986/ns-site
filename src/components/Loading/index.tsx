import classNames from 'classnames';
import styles from './styles.module.scss';
const Loading = () => {
  return (
    <div className={styles.loading}>
      <div
        className={classNames(
          styles.loading__circle,
          styles.loading__circle_first,
        )}
      />
      <div
        className={classNames(
          styles.loading__circle,
          styles.loading__circle_second,
        )}
      />
      <div
        className={classNames(
          styles.loading__circle,
          styles.loading__circle_third,
        )}
      />
      <div
        className={classNames(
          styles.loading__shadow,
          styles.loading__shadow_first,
        )}
      />
      <div
        className={classNames(
          styles.loading__shadow,
          styles.loading__shadow_second,
        )}
      />
      <div
        className={classNames(
          styles.loading__shadow,
          styles.loading__shadow_third,
        )}
      />
      <h2 className={styles.loading__text}>Loading</h2>
    </div>
  );
};

export default Loading;
