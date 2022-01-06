import { INode } from '~/redux/types';
import { useMemo } from 'react';
import { UploadType } from '~/constants/uploads';

export const useNodeImages = (node: INode) => {
  return useMemo(() => node.files.filter(file => file && file.type === UploadType.Image), [
    node.files,
  ]);
};
