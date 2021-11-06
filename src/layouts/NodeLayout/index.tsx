import React, { FC } from 'react';
import { Route } from 'react-router';
import { Card } from '~/components/containers/Card';

import { NodePanel } from '~/components/node/NodePanel';
import { Footer } from '~/components/main/Footer';

import { SidebarRouter } from '~/containers/main/SidebarRouter';
import { Container } from '~/containers/main/Container';
import { useNodeBlocks } from '~/utils/hooks/node/useNodeBlocks';
import { NodeBottomBlock } from '~/components/node/NodeBottomBlock';
import { useNodeCoverImage } from '~/utils/hooks/node/useNodeCoverImage';
import { URLS } from '~/constants/urls';
import { EditorEditDialog } from '~/containers/dialogs/EditorEditDialog';
import { useNodePermissions } from '~/utils/hooks/node/useNodePermissions';
import { IComment, IFile, INode, ITag } from '~/redux/types';
import { INodeRelated } from '~/redux/node/types';

import styles from './styles.module.scss';
import { IUser } from '~/redux/auth/types';

type IProps = {
  node: INode;
  user: IUser;
  lastSeenCurrent?: string;
  related: INodeRelated;
  comments: IComment[];
  commentsCount: number;
  isUser: boolean;
  isLoading: boolean;
  isLoadingComments: boolean;
  onShowImageModal: (images: IFile[], index: number) => void;
  onLoadMoreComments: () => void;
  onDeleteComment: (id: IComment['id'], isLocked: boolean) => void;
  onTagsChange: (tags: string[]) => void;
  onTagClick: (tag: Partial<ITag>) => void;
  onTagDelete: (id: ITag['ID']) => void;
};

const NodeLayout: FC<IProps> = ({
  node,
  user,
  comments,
  commentsCount,
  related,
  lastSeenCurrent,
  isUser,
  isLoading,
  isLoadingComments,
  onLoadMoreComments,
  onDeleteComment,
  onShowImageModal,
  onTagsChange,
  onTagClick,
  onTagDelete,
}) => {
  useNodeCoverImage(node);

  const { head, block } = useNodeBlocks(node, isLoading);
  const [canEdit] = useNodePermissions(node);

  return (
    <div className={styles.wrap}>
      {head}

      <Container className={styles.content}>
        <Card className={styles.node} seamless>
          {block}

          <div className={styles.panel}>
            <NodePanel node={node} isLoading={isLoading} />
          </div>

          <NodeBottomBlock
            isUser={isUser}
            user={user}
            node={node}
            canEdit={canEdit}
            comments={comments}
            commentsCount={commentsCount}
            commentsOrder="DESC"
            related={related}
            isLoadingComments={isLoadingComments}
            isLoading={isLoading}
            lastSeenCurrent={lastSeenCurrent}
            onShowImageModal={onShowImageModal}
            onLoadMoreComments={onLoadMoreComments}
            onDeleteComment={onDeleteComment}
            onTagsChange={onTagsChange}
            onTagClick={onTagClick}
            onTagDelete={onTagDelete}
          />

          <Footer />
        </Card>
      </Container>

      <SidebarRouter prefix="/post:id" />

      <Route path={URLS.NODE_EDIT_URL(':id')} component={EditorEditDialog} />
    </div>
  );
};

export { NodeLayout };
