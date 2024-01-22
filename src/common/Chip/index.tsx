import styles from './styles.module.scss';
interface Props {
  label: string;
}
const Chip = ({ label }: Props) => {
  return <span className={styles.chip}>{label}</span>;
};

export default Chip;
