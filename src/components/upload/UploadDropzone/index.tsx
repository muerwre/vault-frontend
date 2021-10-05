import React, { FC, useCallback } from 'react';
import Dropzone from 'react-dropzone';
import classnames from 'classnames';
import classNames from 'classnames';
import styles from './styles.module.scss';
import { DivProps } from '~/utils/types';
import { DropHereIcon } from '~/components/input/DropHereIcon';
import { useDragDetector } from '~/utils/hooks/useDragDetector';

interface IProps extends DivProps {
  onUpload: (files: File[]) => void;
  helperClassName?: string;
}

const UploadDropzone: FC<IProps> = ({ children, onUpload, helperClassName, ...rest }) => {
  const { isDragging: isDraggingOnBody, onStopDragging } = useDragDetector();
  const onDrop = useCallback(
    (files: File[]) => {
      onStopDragging();
      onUpload(files);
    },
    [onUpload]
  );

  return (
    <Dropzone onDrop={onDrop}>
      {({ getRootProps, isDragActive }) => (
        <div
          {...getRootProps({
            ...rest,
            className: classnames(styles.zone),
          })}
        >
          {children}
          <div
            className={classNames(styles.helper, helperClassName, {
              [styles.active]: isDragActive || isDraggingOnBody,
            })}
          >
            <DropHereIcon className={styles.icon} />
          </div>
        </div>
      )}
    </Dropzone>
  );
};

export { UploadDropzone };
