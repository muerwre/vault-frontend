import { INode } from '~/redux/types';
import { useMemo } from 'react';
import { UploadType } from '~/constants/uploads';

export const useNodeAudios = (node: INode) => {
  if (!node?.files) {
    return [];
  }

  return useMemo(() => node.files.filter(file => file && file.type === UploadType.Audio), [
    node.files,
  ]);
};
