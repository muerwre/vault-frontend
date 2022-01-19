import { usePageCover } from '~/components/containers/PageCoverProvider/usePageCover';
import { INode } from '~/types';

export const useNodeCoverImage = (node: INode) => {
  usePageCover(node.cover);
};
