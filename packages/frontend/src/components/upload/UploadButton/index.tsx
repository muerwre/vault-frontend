import { ChangeEvent, FC, useCallback, ReactNode } from 'react';

import { PlusIcon } from 'lucide-react';

import { Button } from '~/components/input/Button';
import { UploadType } from '~/constants/uploads';
import { useNodeFormContext } from '~/hooks/node/useNodeFormFormik';
import { IEditorComponentProps } from '~/types/node';
import { useUploaderContext } from '~/utils/context/UploaderContextProvider';
import { getPlacementName } from '~/utils/node';
import { getFileType } from '~/utils/uploader';

import styles from './styles.module.scss';

type Props = IEditorComponentProps & {
  accept?: string;
  icon?: ReactNode;
  type?: UploadType;
  label?: string;
};

const UploadButton: FC<Props> = ({
  accept = 'image/*',
  icon = <PlusIcon size={24} />,
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

  const color = getPlacementName(values);

  return (
    <Button
      type="button"
      round
      size="giant"
      className={styles.wrap}
      label={label}
      color={color}
    >
      {icon}
      <input type="file" onChange={onInputChange} accept={accept} multiple />
    </Button>
  );
};

export { UploadButton };
