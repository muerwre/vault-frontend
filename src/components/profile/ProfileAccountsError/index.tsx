import React, { FC } from 'react';
import styles from './styles.scss';
import { Group } from '~/components/containers/Group';
import { ERROR_LITERAL } from '~/constants/errors';
import { Button } from '~/components/input/Button';

interface IProps {
  onClose: () => void;
  error: string;
}

const ProfileAccountsError: FC<IProps> = ({ onClose, error }) => (
  <div className={styles.wrap}>
    <Group className={styles.content}>
      <div className={styles.title}>О НЕТ!</div>
      <div className={styles.text}>{ERROR_LITERAL[error] || error}</div>
      <Button onClick={onClose}>Оу, жаль</Button>
    </Group>
  </div>
);

export { ProfileAccountsError };
