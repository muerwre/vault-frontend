import React, { FC } from 'react';
import { EditorUploadButton } from '~/components/editors/EditorUploadButton';
import { INode } from '~/redux/types';
import { UPLOAD_TYPES } from '~/redux/uploads/constants';
import { IEditorComponentProps } from '~/redux/node/types';

type IProps = IEditorComponentProps & {};

const EditorImageUploadButton: FC<IProps> = ({ data, setData, temp, setTemp }) => (
  <EditorUploadButton
    data={data}
    setData={setData}
    temp={temp}
    setTemp={setTemp}
    accept="image/*"
    icon="image"
    type={UPLOAD_TYPES.IMAGE}
  />
);

export { EditorImageUploadButton };
