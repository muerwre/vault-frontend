import React, { FC } from 'react';
import { EditorUploadButton } from '~/components/editors/EditorUploadButton';
import { INode } from '~/redux/types';

interface IProps {
  data: INode;
  setData: (val: INode) => void;
  temp: string[];
  setTemp: (val: string[]) => void;
}

const EditorImageUploadButton: FC<IProps> = ({ data, setData, temp, setTemp }) => (
  <EditorUploadButton
    data={data}
    setData={setData}
    temp={temp}
    setTemp={setTemp}
    accept="image/*"
    icon="image"
  />
);

export { EditorImageUploadButton };
