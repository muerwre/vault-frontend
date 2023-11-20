import React, { FC } from 'react';

import { Group } from '~/components/common/Group';
import { Button } from '~/components/input/Button';
import { ERROR_LITERAL } from '~/constants/errors';

import styles from './styles.module.scss';

interface IProps {
  onClose: () => void;
  error: string;
}

const ProfileAccountsError: FC<IProps> = ({ onClose, error }) => (
  <div className={styles.wrap}>
    <Group className={styles.content}>
      <div className={styles.title}>О НЕТ!</div>
      <div className={styles.text}>{ERROR_LITERAL[error] || error}</div>
      <Button onClick={onClose} size="small">
        Оу, жаль
      </Button>
    </Group>
  </div>
);

export { ProfileAccountsError };
