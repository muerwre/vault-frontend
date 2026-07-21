import { FC, useCallback } from 'react';

import { Button } from '~/components/input/Button';
import { IComment } from '~/types';

import styles from './styles.module.scss';

interface Props {
  id: IComment['id'];
  onDelete: (id: IComment['id'], isLocked: boolean) => void;
}

const CommendDeleted: FC<Props> = ({ id, onDelete }) => {
  const onRestore = useCallback(() => onDelete(id, false), [id, onDelete]);

  return (
    <div className={styles.wrap}>
      <div>Комментарий удалён</div>
      <Button
        size="mini"
        onClick={onRestore}
        color="link"
        iconLeft="restore"
        className={styles.button}
      >
        Восстановить
      </Button>
    </div>
  );
};

export { CommendDeleted };
