import React, { FC } from 'react';

import { Group } from '~/components/containers/Group';
import { Padder } from '~/components/containers/Padder';
import { Sticky } from '~/components/containers/Sticky';
import { NodeAuthorBlock } from '~/components/node/NodeAuthorBlock';
import { NodeCommentForm } from '~/components/node/NodeCommentForm';
import { NodeDeletedBadge } from '~/components/node/NodeDeletedBadge';
import { NodeNoComments } from '~/components/node/NodeNoComments';
import { NodeRelatedBlock } from '~/components/node/NodeRelatedBlock';
import { NodeTagsBlock } from '~/components/node/NodeTagsBlock';
import { NodeComments } from '~/containers/node/NodeComments';
import { useNodeBlocks } from '~/hooks/node/useNodeBlocks';
import { useCommentContext } from '~/utils/context/CommentContextProvider';
import { useNodeContext } from '~/utils/context/NodeContextProvider';
import { useNodeRelatedContext } from '~/utils/context/NodeRelatedContextProvider';
import { useUserContext } from '~/utils/context/UserContextProvider';
import { useAuthProvider } from '~/utils/providers/AuthProvider';

import styles from './styles.module.scss';

interface IProps {
  commentsOrder: 'ASC' | 'DESC';
}

const NodeBottomBlock: FC<IProps> = ({ commentsOrder }) => {
  const user = useUserContext();
  const { node, isLoading } = useNodeContext();
  const { comments, isLoading: isLoadingComments, onSaveComment } = useCommentContext();
  const { related, isLoading: isLoadingRelated } = useNodeRelatedContext();
  const { inline } = useNodeBlocks(node, isLoading);
  const { isUser } = useAuthProvider();

  if (node.deleted_at) {
    return <NodeDeletedBadge />;
  }

  return (
    <Group>
      <Padder>
        <Group horizontal className={styles.content}>
          <Group className={styles.comments}>
            {inline && <div className={styles.inline}>{inline}</div>}

            {isLoading || isLoadingComments || (!comments.length && !inline) ? (
              <NodeNoComments is_loading={isLoadingComments || isLoading} />
            ) : (
              <NodeComments order={commentsOrder} />
            )}

            {isUser && !isLoading && (
              <NodeCommentForm nodeId={node.id} saveComment={onSaveComment} user={user} />
            )}
          </Group>

          <div className={styles.panel}>
            <div className={styles.left}>
              <Sticky>
                <div className={styles.left_item}>
                  <NodeAuthorBlock user={node?.user} />
                </div>

                <div className={styles.left_item}>
                  <NodeTagsBlock />
                </div>
                <div className={styles.left_item}>
                  <NodeRelatedBlock isLoading={isLoadingRelated} node={node} related={related} />
                </div>
              </Sticky>
            </div>
          </div>
        </Group>
      </Padder>
    </Group>
  );
};

export { NodeBottomBlock };
