import React, { FC } from 'react';
import * as styles from './styles.scss';
import { INode } from '~/redux/types';
import { EditorUploadButton } from '~/components/editors/EditorUploadButton';
import { NODE_UPLOAD_TYPES } from '~/redux/node/constants';

interface IProps {
  data: INode;
  setData: (val: INode) => void;
  temp: string[];
  setTemp: (val: string[]) => void;
}

const EditorPanel: FC<IProps> = ({ data, setData, temp, setTemp }) => (
  <div className={styles.panel}>
    {data.type && NODE_UPLOAD_TYPES[data.type] && (
      <EditorUploadButton data={data} setData={setData} temp={temp} setTemp={setTemp} />
    )}
  </div>
);

export { EditorPanel };
