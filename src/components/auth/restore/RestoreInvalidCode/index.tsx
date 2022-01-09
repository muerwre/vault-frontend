import React, { VFC } from 'react';
import styles from './styles.module.scss';
import { Group } from '~/components/containers/Group';
import { Icon } from '~/components/input/Icon';
import { ERROR_LITERAL, ERRORS } from '~/constants/errors';
import { Button } from '~/components/input/Button';

interface RestoreInvalidCodeProps {
  error: string;
  onClose: () => void;
}

const RestoreInvalidCode: VFC<RestoreInvalidCodeProps> = ({ error, onClose }) => (
  <Group className={styles.error_shade}>
    <Icon icon="close" size={64} />

    <div>{error || ERROR_LITERAL[ERRORS.CODE_IS_INVALID]}</div>

    <div className={styles.spacer} />

    <Button color="primary" onClick={onClose}>
      Очень жаль
    </Button>
  </Group>
);

export { RestoreInvalidCode };
