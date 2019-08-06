import React, { FC } from 'react';
import { INode } from '~/redux/types';
import * as styles from './styles.scss';

interface IProps {
  data: INode,
  setData: (val: INode) => void;
};

const ImageEditor: FC<IProps> = ({
}) => (
    <div className={styles.uploads}>
      <div />
    </div>
  )

export { ImageEditor };