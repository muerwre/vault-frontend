import React, { FC, useCallback } from "react";

import classNames from "classnames";

import { ArcProgress } from "~/components/input/ArcProgress";
import { Icon } from "~/components/input/Icon";

import styles from "./styles.module.scss";

interface IProps {
  id?: string;
  title?: string;
  progress?: number;
  onDrop?: (file_id: string) => void;

  is_uploading?: boolean;
}

const AudioUpload: FC<IProps> = ({ title, progress, is_uploading, id, onDrop }) => {
  const onDropFile = useCallback(() => {
    if (!id || !onDrop) return;
    onDrop(id);
  }, [id, onDrop]);

  return (
    <div className={styles.wrap}>
      {id && onDrop && (
        <div className={styles.drop} onMouseDown={onDropFile}>
          <Icon icon="close" />
        </div>
      )}

      <div className={classNames(styles.thumb_wrap, { is_uploading })}>
        {is_uploading && (
          <div className={styles.progress}>
            <ArcProgress size={40} progress={progress} />
          </div>
        )}
        {title && <div className={styles.title}>{title}</div>}
      </div>
    </div>
  );
};

export { AudioUpload };
