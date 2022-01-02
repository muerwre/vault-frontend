import { INode } from '~/redux/types';
import { usePageCover } from '~/components/containers/PageCoverProvider/usePageCover';

export const useNodeCoverImage = (node: INode) => {
  usePageCover(node.cover);
};
