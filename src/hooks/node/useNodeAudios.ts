import { useMemo } from 'react';

import { UploadType } from '~/constants/uploads';
import { INode } from '~/types';

export const useNodeAudios = (node: INode) => {
  return useMemo(
    () => node.files.filter((file) => file && file.type === UploadType.Audio),
    [node.files],
  );
};
