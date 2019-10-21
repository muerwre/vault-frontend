import React, { FC, createElement } from 'react';
import * as styles from './styles.scss';
import { INode } from '~/redux/types';
import { NODE_PANEL_COMPONENTS } from '~/redux/node/constants';

interface IProps {
  data: INode;
  setData: (val: INode) => void;
  temp: string[];
  setTemp: (val: string[]) => void;
}

const EditorPanel: FC<IProps> = ({ data, setData, temp, setTemp }) => (
  <div className={styles.panel}>
    {NODE_PANEL_COMPONENTS[data.type] &&
      NODE_PANEL_COMPONENTS[data.type].map((el, key) =>
        createElement(el, { key, data, setData, temp, setTemp })
      )}
  </div>
);

export { EditorPanel };
