import { INode } from '~/redux/types';
import { useMemo } from 'react';
import { UPLOAD_TYPES } from '~/redux/uploads/constants';

export const useNodeAudios = (node: INode) => {
  return useMemo(() => node.files.filter(file => file && file.type === UPLOAD_TYPES.AUDIO), [
    node.files,
  ]);
};
