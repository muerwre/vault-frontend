import React, { ChangeEvent, FC, useCallback } from 'react';
import styles from './styles.module.scss';
import { Icon } from '~/components/input/Icon';
import { UploadType } from '~/constants/uploads';
import { IEditorComponentProps } from '~/types/node';
import { getFileType } from '~/utils/uploader';
import { useNodeFormContext } from '~/hooks/node/useNodeFormFormik';
import { Button } from '~/components/input/Button';
import { useUploaderContext } from '~/utils/context/UploaderContextProvider';

type IProps = IEditorComponentProps & {
  accept?: string;
  icon?: string;
  type?: UploadType;
  label?: string;
};

const EditorUploadButton: FC<IProps> = ({
  accept = 'image/*',
  icon = 'plus',
  type = UploadType.Image,
  label,
}) => {
  const { uploadFiles } = useUploaderContext()!;
  const { values } = useNodeFormContext();

  const onInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      event.preventDefault();

      const files = Array.from(event.target.files || []).filter(
        file => !type || getFileType(file) === type
      );

      uploadFiles(files);
    },
    [type, uploadFiles]
  );

  const color = values.is_promoted ? 'primary' : 'lab';

  return (
    <Button type="button" round size="giant" className={styles.wrap} label={label} color={color}>
      <Icon icon={icon} size={24} />
      <input type="file" onChange={onInputChange} accept={accept} multiple />
    </Button>
  );
};

export { EditorUploadButton };
