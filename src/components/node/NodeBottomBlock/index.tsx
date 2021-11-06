import React, { FC } from 'react';
import { NodeDeletedBadge } from '~/components/node/NodeDeletedBadge';
import { Group } from '~/components/containers/Group';
import { Padder } from '~/components/containers/Padder';
import { NodeCommentsBlock } from '~/components/node/NodeCommentsBlock';
import { NodeCommentForm } from '~/components/node/NodeCommentForm';
import { NodeRelatedBlock } from '~/components/node/NodeRelatedBlock';
import { useNodeBlocks } from '~/utils/hooks/node/useNodeBlocks';
import { IComment, IFile, INode } from '~/redux/types';
import { NodeTagsBlock } from '~/components/node/NodeTagsBlock';
import { INodeRelated } from '~/redux/node/types';
import StickyBox from 'react-sticky-box/dist/esnext';
import styles from './styles.module.scss';
import { NodeAuthorBlock } from '~/components/node/NodeAuthorBlock';
import { IUser } from '~/redux/auth/types';

interface IProps {
  node: INode;
  user: IUser;
  isUser: boolean;
  canEdit: boolean;
  isLoading: boolean;
  commentsOrder: 'ASC' | 'DESC';
  comments: IComment[];
  commentsCount: number;
  isLoadingComments: boolean;
  related: INodeRelated;
  lastSeenCurrent?: string;
  onShowImageModal: (images: IFile[], index: number) => void;
  onLoadMoreComments: () => void;
  onDeleteComment: (id: IComment['id'], isLocked: boolean) => void;
}

const NodeBottomBlock: FC<IProps> = ({
  node,
  user,
  canEdit,
  isLoading,
  isUser,
  isLoadingComments,
  comments,
  commentsCount,
  commentsOrder,
  related,
  lastSeenCurrent,
  onLoadMoreComments,
  onDeleteComment,
  onShowImageModal,
}) => {
  const { inline } = useNodeBlocks(node, isLoading);

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
              lastSeenCurrent={lastSeenCurrent}
              isLoading={isLoading}
              isLoadingComments={isLoadingComments}
              comments={comments}
              count={commentsCount}
              order={commentsOrder}
              user={user}
              node={node}
              onShowImageModal={onShowImageModal}
              onLoadMoreComments={onLoadMoreComments}
              onDeleteComment={onDeleteComment}
            />

            {isUser && !isLoading && <NodeCommentForm nodeId={node.id} />}
          </Group>

          <div className={styles.panel}>
            <StickyBox className={styles.sticky} offsetTop={72}>
              <div className={styles.left}>
                <div className={styles.left_item}>
                  <NodeAuthorBlock user={node?.user} />
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
