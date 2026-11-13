import { ChangeEvent, FC, useCallback } from 'react';

import classNames from 'classnames';

import { Icon } from '~/components/common/Icon';
import { UploadType } from '~/constants/uploads';
import { useUploaderContext } from '~/utils/context/UploaderContextProvider';
import { getFileType } from '~/utils/uploader';

import { SubmitCard } from '../SubmitCard';

import styles from './styles.module.scss';

interface Props {
  type: UploadType;
  label: string;
  icon: string;
  /** A square photo tile, or a row the height of a song. */
  variant: 'tile' | 'row';
}

/** The last card of an upload grid: picks files of its type to upload. */
const SubmitUploadCard: FC<Props> = ({ type, label, icon, variant }) => {
  const { uploadFiles } = useUploaderContext()!;

  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []).filter(
        (file) => getFileType(file) === type,
      );

      // Cleared so picking the same files again still fires a change.
      event.target.value = '';

      if (files.length) {
        void uploadFiles(files);
      }
    },
    [type, uploadFiles],
  );

  return (
    <SubmitCard
      as="label"
      className={classNames(styles.card, styles[variant])}
      title={label}
    >
      <span className={styles.content}>
        <Icon icon={icon} size={24} />
        <span className={styles.label}>{label}</span>
      </span>

      <input
        type="file"
        accept={`${type}/*`}
        multiple
        className={styles.input}
        onChange={onChange}
      />
    </SubmitCard>
  );
};

export { SubmitUploadCard };
