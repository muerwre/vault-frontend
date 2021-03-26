import React, { ChangeEvent, FC, useCallback } from 'react';
import styles from './styles.module.scss';
import { Icon } from '~/components/input/Icon';
import { UPLOAD_TYPES } from '~/redux/uploads/constants';
import { IEditorComponentProps } from '~/redux/node/types';
import { useFileUploaderContext } from '~/utils/hooks/fileUploader';
import { getFileType } from '~/utils/uploader';

type IProps = IEditorComponentProps & {
  accept?: string;
  icon?: string;
  type?: typeof UPLOAD_TYPES[keyof typeof UPLOAD_TYPES];
};

const EditorUploadButton: FC<IProps> = ({
  accept = 'image/*',
  icon = 'plus',
  type = UPLOAD_TYPES.IMAGE,
}) => {
  const { uploadFiles } = useFileUploaderContext()!;

  const onInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      event.preventDefault();

      const files = Array.from(event.target.files || []).filter(
        file => !type || getFileType(file) === type
      );

      uploadFiles(files);
    },
    [uploadFiles]
  );

  return (
    <div className={styles.wrap}>
      <input type="file" onChange={onInputChange} accept={accept} multiple />

      <div className={styles.icon}>
        <Icon size={32} icon={icon} />
      </div>
    </div>
  );
};

export { EditorUploadButton };
