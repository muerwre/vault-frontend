import styles from './styles.module.scss';

const BottomContainer = ({ children }) => (
  <div className={styles.wrap}>
    <div className={styles.content}>
      <div className={styles.padder}></div>
    </div>
  </div>
);

export { BottomContainer };
