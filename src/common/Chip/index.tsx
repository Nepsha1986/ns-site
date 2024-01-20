import styles from './styles.module.scss';
interface Props {
  label: string;
}
const Chip = ({ label }: Props) => {
  return <div className={styles.chip}>{label}</div>;
};

export default Chip;
