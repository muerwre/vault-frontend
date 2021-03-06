import React, { FC } from 'react';
import { NodeDeletedBadge } from '~/components/node/NodeDeletedBadge';
import { Group } from '~/components/containers/Group';
import { Padder } from '~/components/containers/Padder';
import styles from '~/containers/node/NodeLayout/styles.module.scss';
import { NodeCommentsBlock } from '~/components/node/NodeCommentsBlock';
import { NodeCommentForm } from '~/components/node/NodeCommentForm';
import { Sticky } from '~/components/containers/Sticky';
import { NodeRelatedBlock } from '~/components/node/NodeRelatedBlock';
import { useNodeBlocks } from '~/utils/hooks/node/useNodeBlocks';
import { IComment, INode } from '~/redux/types';
import { useUser } from '~/utils/hooks/user/userUser';
import { NodeTagsBlock } from '~/components/node/NodeTagsBlock';
import { INodeRelated } from '~/redux/node/types';

interface IProps {
  node: INode;
  isLoading: boolean;
  commentsOrder: 'ASC' | 'DESC';
  comments: IComment[];
  commentsCount: number;
  isLoadingComments: boolean;
  related: INodeRelated;
}

const NodeBottomBlock: FC<IProps> = ({
  node,
  isLoading,
  isLoadingComments,
  comments,
  commentsCount,
  commentsOrder,
  related,
}) => {
  const { inline } = useNodeBlocks(node, isLoading);
  const { is_user } = useUser();

  if (node.deleted_at) {
    return <NodeDeletedBadge />;
  }

  return (
    <Group>
      <Padder>
        <Group horizontal className={styles.content}>
          <Group className={styles.comments}>
            {inline && <div className={styles.inline}>{inline}</div>}

            <NodeCommentsBlock
              isLoading={isLoading}
              isLoadingComments={isLoadingComments}
              comments={comments}
              count={commentsCount}
              order={commentsOrder}
              node={node}
            />

            {is_user && !isLoading && <NodeCommentForm nodeId={node.id} />}
          </Group>

          <div className={styles.panel}>
            <Sticky>
              <Group style={{ flex: 1, minWidth: 0 }}>
                <NodeTagsBlock node={node} isLoading={isLoading} />
                <NodeRelatedBlock isLoading={isLoading} node={node} related={related} />
              </Group>
            </Sticky>
          </div>
        </Group>
      </Padder>
    </Group>
  );
};

export { NodeBottomBlock };
