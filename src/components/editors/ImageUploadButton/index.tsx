import React, { FC, ChangeEventHandler } from 'react';
import * as styles from './styles.scss';

interface IProps {
  onUpload?: ChangeEventHandler<HTMLInputElement>;
};

const ImageUploadButton: FC<IProps> = ({
  onUpload,
}) => (
    <div className={styles.wrap}>
      <input type="file" onChange={onUpload} />
    </div>
  )

export { ImageUploadButton };