import React, { ChangeEvent, FC, useCallback } from 'react';
import styles from './styles.module.scss';
import { Icon } from '~/components/input/Icon';
import { UPLOAD_TYPES } from '~/redux/uploads/constants';
import { IEditorComponentProps } from '~/redux/node/types';
import { useFileUploaderContext } from '~/utils/hooks/fileUploader';
import { getFileType } from '~/utils/uploader';
import { useNodeFormContext } from '~/utils/hooks/useNodeFormFormik';
import { Button } from '~/components/input/Button';

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
  const { values } = useNodeFormContext();

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
    <Button type="button" round size="giant" className={styles.wrap}>
      <Icon icon={icon} size={24} />
      <input type="file" onChange={onInputChange} accept={accept} multiple />
    </Button>
  );
};

export { EditorUploadButton };
