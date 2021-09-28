import React, { FC } from 'react';
import { NodeDeletedBadge } from '~/components/node/NodeDeletedBadge';
import { Group } from '~/components/containers/Group';
import { Padder } from '~/components/containers/Padder';
import { NodeCommentsBlock } from '~/components/node/NodeCommentsBlock';
import { NodeCommentForm } from '~/components/node/NodeCommentForm';
import { NodeRelatedBlock } from '~/components/node/NodeRelatedBlock';
import { useNodeBlocks } from '~/utils/hooks/node/useNodeBlocks';
import { IComment, INode } from '~/redux/types';
import { useUser } from '~/utils/hooks/user/userUser';
import { NodeTagsBlock } from '~/components/node/NodeTagsBlock';
import { INodeRelated } from '~/redux/node/types';
import StickyBox from 'react-sticky-box/dist/esnext';
import styles from './styles.module.scss';
import { NodeAuthorBlock } from '~/components/node/NodeAuthorBlock';

interface IProps {
  node: INode;
  canEdit: boolean;
  isLoading: boolean;
  commentsOrder: 'ASC' | 'DESC';
  comments: IComment[];
  commentsCount: number;
  isLoadingComments: boolean;
  related: INodeRelated;
}

const NodeBottomBlock: FC<IProps> = ({
  node,
  canEdit,
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
            <StickyBox className={styles.sticky} offsetTop={72}>
              <div className={styles.left}>
                <div className={styles.left_item}>
                  <NodeAuthorBlock node={node} />
                </div>
                <div className={styles.left_item}>
                  <NodeTagsBlock node={node} canEdit={canEdit} isLoading={isLoading} />
                </div>
                <div className={styles.left_item}>
                  <NodeRelatedBlock isLoading={isLoading} node={node} related={related} />
                </div>
              </div>
            </StickyBox>
          </div>
        </Group>
      </Padder>
    </Group>
  );
};

export { NodeBottomBlock };
