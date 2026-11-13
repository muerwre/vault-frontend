import { FC } from 'react';

import classNames from 'classnames';

import { Icon } from '~/components/common/Icon';
import { UploadType } from '~/constants/uploads';

import { SubmitCard } from '../SubmitCard';
import { useUploadPicked } from '../hooks/useUploadPicked';

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
  const onChange = useUploadPicked(type);

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
