import { ComponentProps, FC } from 'react';

import { Button } from '~/components/input/Button';
import { UploadType } from '~/constants/uploads';

import { useUploadPicked } from '../hooks/useUploadPicked';

import styles from './styles.module.scss';

type Props = Pick<ComponentProps<typeof Button>, 'color' | 'iconLeft'> & {
  type: UploadType;
  label: string;
};

/** A pill button that opens the file picker and uploads what is picked. */
const SubmitPickButton: FC<Props> = ({ type, label, color, iconLeft }) => {
  const onChange = useUploadPicked(type);

  return (
    <Button
      type="button"
      color={color}
      iconLeft={iconLeft}
      className={styles.button}
      round
    >
      {label}
      <input
        type="file"
        accept={`${type}/*`}
        multiple
        className={styles.input}
        onChange={onChange}
      />
    </Button>
  );
};

export { SubmitPickButton };
