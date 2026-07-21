import { INode } from '~/types';
import { usePageCover } from '~/utils/providers/PageCoverProvider';

export const useNodeCoverImage = (node: INode) => {
  usePageCover(node.cover);
};
