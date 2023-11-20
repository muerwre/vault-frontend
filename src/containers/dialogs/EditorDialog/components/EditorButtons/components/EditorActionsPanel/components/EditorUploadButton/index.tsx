import { ChangeEvent, FC, useCallback } from 'react';

import { Icon } from '~/components/common/Icon';
import { Button } from '~/components/input/Button';
import { UploadType } from '~/constants/uploads';
import { useNodeFormContext } from '~/hooks/node/useNodeFormFormik';
import { IEditorComponentProps } from '~/types/node';
import { useUploaderContext } from '~/utils/context/UploaderContextProvider';
import { getFileType } from '~/utils/uploader';

import styles from './styles.module.scss';

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
        (file) => !type || getFileType(file) === type,
      );

      uploadFiles(files);
    },
    [type, uploadFiles],
  );

  const color = values.is_promoted ? 'flow' : 'lab';

  return (
    <Button
      type="button"
      round
      size="giant"
      className={styles.wrap}
      label={label}
      color={color}
    >
      <Icon icon={icon} size={24} />
      <input type="file" onChange={onInputChange} accept={accept} multiple />
    </Button>
  );
};

export { EditorUploadButton };
