import React, { FC, useCallback } from "react";
import styles from "./styles.module.scss";
import { Button } from "~/components/input/Button";
import { IComment } from "~/redux/types";

interface IProps {
  id: IComment['id'];
  onDelete: (id: IComment['id'], isLocked: boolean) => void;
}

const CommendDeleted: FC<IProps> = ({ id, onDelete }) => {
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
