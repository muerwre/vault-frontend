import React, { FC } from 'react';
import * as styles from './styles.scss';
import { INode } from '~/redux/types';

interface IProps {
  data: INode;
  setData: (val: INode) => void;
  onUpload: (val: File[]) => void;
};

const EditorPanel: FC<IProps> = ({
}) => (
    <div className={styles.panel} />
  );

export { EditorPanel };
