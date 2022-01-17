import React, { FC } from 'react';
import { NodeRelatedPlaceholder } from '~/components/node/NodeRelated/placeholder';
import { NodeRelated } from '~/components/node/NodeRelated';
import { URLS } from '~/constants/urls';
import { INode } from '~/types';
import { INodeRelated } from '~/types/node';
import { Anchor } from '~/components/common/Anchor';

interface IProps {
  isLoading: boolean;
  node: INode;
  related: INodeRelated;
}

const NodeRelatedBlock: FC<IProps> = ({ isLoading, node, related }) => {
  if (isLoading) {
    return <NodeRelatedPlaceholder />;
  }

  return (
    <div>
      {related &&
        related.albums &&
        !!node?.id &&
        Object.keys(related.albums)
          .filter(album => related.albums[album].length > 0)
          .map(album => (
            <NodeRelated
              title={
                <Anchor href={URLS.NODE_TAG_URL(node.id!, encodeURIComponent(album))}>
                  {album}
                </Anchor>
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
