import { INode } from '~/redux/types';
import { useMemo } from 'react';
import { UPLOAD_TYPES } from '~/redux/uploads/constants';

export const useNodeVideos = (node: INode) => {
  if (!node?.files) {
    return [];
  }

  return useMemo(() => node.files.filter(file => file && file.type === UPLOAD_TYPES.VIDEO), [
    node.files,
  ]);
};
