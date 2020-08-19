import React, { FC } from 'react';
import { EditorUploadButton } from '~/components/editors/EditorUploadButton';
import { UPLOAD_TYPES } from '~/redux/uploads/constants';
import { IEditorComponentProps } from '~/redux/node/types';

type IProps = IEditorComponentProps & {};

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
