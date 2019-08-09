import React, { FC, ChangeEventHandler } from 'react';
import * as styles from './styles.scss';
import { INode } from '~/redux/types';
import { EditorUploadButton } from '~/components/editors/EditorUploadButton';

interface IProps {
  data: INode;
  setData: (val: INode) => void;
  onUpload: ChangeEventHandler<HTMLInputElement>;
}

const EditorPanel: FC<IProps> = ({ onUpload }) => (
  <div className={styles.panel}>
    <EditorUploadButton onUpload={onUpload} />
  </div>
);

export { EditorPanel };
