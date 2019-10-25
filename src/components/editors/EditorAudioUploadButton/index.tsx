import React, { FC } from 'react';
import { EditorUploadButton } from '~/components/editors/EditorUploadButton';
import { INode } from '~/redux/types';
import { UPLOAD_TYPES } from '~/redux/uploads/constants';

interface IProps {
  data: INode;
  setData: (val: INode) => void;
  temp: string[];
  setTemp: (val: string[]) => void;
}

const EditorAudioUploadButton: FC<IProps> = ({ data, setData, temp, setTemp }) => (
  <EditorUploadButton
    data={data}
    setData={setData}
    temp={temp}
    setTemp={setTemp}
    accept="audio/*"
    icon="audio"
    type={UPLOAD_TYPES.AUDIO}
  />
);

export { EditorAudioUploadButton };
