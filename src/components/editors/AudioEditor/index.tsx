import React, { FC, useCallback } from 'react';
import { INode } from '~/redux/types';
import path from 'ramda/es/path';

interface IProps {
  data: INode;
  setData: (val: INode) => void;
}

const AudioEditor: FC<IProps> = ({ data, setData }) => {
  return <div>something!</div>;
};

export { AudioEditor };
