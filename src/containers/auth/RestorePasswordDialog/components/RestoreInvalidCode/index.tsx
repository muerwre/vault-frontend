import { VFC } from 'react';

import { Group } from '~/components/common/Group';
import { Icon } from '~/components/common/Icon';
import { Button } from '~/components/input/Button';
import { ERROR_LITERAL, ERRORS } from '~/constants/errors';

import styles from './styles.module.scss';

interface RestoreInvalidCodeProps {
  error: string;
  onClose: () => void;
}

const RestoreInvalidCode: VFC<RestoreInvalidCodeProps> = ({
  error,
  onClose,
}) => (
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
