import React, { FC, ChangeEventHandler } from 'react';
import * as styles from './styles.scss';
import { Icon } from '~/components/input/Icon';

interface IProps {
  onUpload?: ChangeEventHandler<HTMLInputElement>;
}

const EditorUploadButton: FC<IProps> = ({
  onUpload,
}) => (
  <div className={styles.wrap}>
    <input type="file" onChange={onUpload} accept="image/*" multiple />

    <div className={styles.icon}>
      <Icon size={32} icon="plus" />
    </div>
  </div>
);

export { EditorUploadButton };
