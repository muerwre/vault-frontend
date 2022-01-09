import React, { FC } from 'react';
import { Route } from 'react-router';
import { Card } from '~/components/containers/Card';

import { Footer } from '~/components/main/Footer';

import { SidebarRouter } from '~/containers/main/SidebarRouter';
import { Container } from '~/containers/main/Container';
import { useNodeBlocks } from '~/hooks/node/useNodeBlocks';
import { NodeBottomBlock } from '~/containers/node/NodeBottomBlock';
import { useNodeCoverImage } from '~/hooks/node/useNodeCoverImage';
import { URLS } from '~/constants/urls';
import { EditorEditDialog } from '~/containers/dialogs/EditorEditDialog';

import styles from './styles.module.scss';
import { useNodeContext } from '~/utils/context/NodeContextProvider';
import { useNodePermissions } from '~/hooks/node/useNodePermissions';
import { useNodeActions } from '~/hooks/node/useNodeActions';
import { NodeTitle } from '~/components/node/NodeTitle';

type IProps = {};

const NodeLayout: FC<IProps> = () => {
  const { node, isLoading, update } = useNodeContext();
  const { head, block } = useNodeBlocks(node, isLoading);
  const [canEdit, canLike, canStar] = useNodePermissions(node);
  const { onLike, onStar, onLock } = useNodeActions(node, update);

  useNodeCoverImage(node);

  return (
    <div className={styles.wrap}>
      {head}

      <Container className={styles.content}>
        <Card className={styles.node} seamless>
          {block}

          <div className={styles.panel}>
            <NodeTitle
              id={node.id}
              title={node.title}
              username={node.user?.username}
              likeCount={node?.like_count || 0}
              isHeroic={!!node.is_heroic}
              isLiked={!!node.is_liked}
              isLocked={!!node.deleted_at}
              isLoading={isLoading}
              createdAt={node.created_at || ''}
              canEdit={canEdit}
              canLike={canLike}
              canStar={canStar}
              onLike={onLike}
              onStar={onStar}
              onLock={onLock}
            />
          </div>

          <NodeBottomBlock commentsOrder="DESC" />

          <Footer />
        </Card>
      </Container>

      <SidebarRouter prefix="/post:id" />

      <Route path={URLS.NODE_EDIT_URL(':id')} component={EditorEditDialog} />
    </div>
  );
};

export { NodeLayout };
