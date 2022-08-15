import React, { FC, useCallback } from 'react';

import { Pressable } from '~/components/common/Pressable';
import { NodeRelated } from '~/components/node/NodeRelated';
import { NodeRelatedPlaceholder } from '~/components/node/NodeRelated/placeholder';
import { Dialog } from '~/constants/modal';
import { useShowModal } from '~/hooks/modal/useShowModal';
import { useTagSidebar } from '~/hooks/sidebar/useTagSidebar';
import { INode, ITag } from '~/types';
import { INodeRelated } from '~/types/node';
import { useSidebar } from '~/utils/providers/SidebarProvider';

interface IProps {
  isLoading: boolean;
  node: INode;
  related: INodeRelated;
}

const NodeRelatedBlock: FC<IProps> = ({ isLoading, node, related }) => {
  const goToTag = useTagSidebar();

  if (isLoading) {
    return <NodeRelatedPlaceholder />;
  }

  return (
    <div>
      {related &&
        related.albums &&
        !!node?.id &&
        Object.keys(related.albums)
          .filter((album) => related.albums[album].length > 0)
          .map((album) => (
            <NodeRelated
              title={
                <Pressable onClick={() => goToTag(album)}>{album}</Pressable>
              }
              items={related.albums[album]}
              key={album}
            />
          ))}

      {related && related.similar && related.similar.length > 0 && (
        <NodeRelated title="ПОХОЖИЕ" items={related.similar} />
      )}
    </div>
  );
};

export { NodeRelatedBlock };
