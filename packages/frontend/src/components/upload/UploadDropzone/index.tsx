import { FC, useCallback } from 'react';

import classnames from 'classnames';
import classNames from 'classnames';
import Dropzone from 'react-dropzone';

import { DropHereIcon } from '~/components/common/DropHereIcon';
import { useDragDetector } from '~/hooks/dom/useDragDetector';
import { DivProps } from '~/utils/types';

import styles from './styles.module.scss';

interface Props extends DivProps {
  onUpload: (files: File[]) => void;
  helperClassName?: string;
}

const UploadDropzone: FC<Props> = ({
  children,
  onUpload,
  helperClassName,
  ...rest
}) => {
  const { isDragging: isDraggingOnBody, onStopDragging } = useDragDetector();
  const onDrop = useCallback(
    (files: File[]) => {
      onStopDragging();
      onUpload(files);
    },
    [onStopDragging, onUpload],
  );

  return (
    <Dropzone onDrop={onDrop} noClick>
      {({ getRootProps, isDragActive, getInputProps }) => (
        <div
          {...getRootProps({
            ...rest,
            className: classnames(styles.zone),
          })}
        >
          <input {...getInputProps()} />

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
