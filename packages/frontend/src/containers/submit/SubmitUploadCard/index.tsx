import { FC, ReactNode } from 'react';

import classNames from 'classnames';

import { UploadType } from '~/constants/uploads';

import { SubmitCard } from '../SubmitCard';
import { useUploadPicked } from '../hooks/useUploadPicked';

import styles from './styles.module.scss';

interface Props {
  type: UploadType;
  label: string;
  icon: ReactNode;
  /** A square photo tile. */
  variant: 'tile';
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
        {icon}
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
