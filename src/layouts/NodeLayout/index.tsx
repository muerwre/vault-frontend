import React, { useCallback } from 'react';

import { observer } from 'mobx-react-lite';

import { Superpower } from '~/components/boris/Superpower';
import { ScrollHelperBottom } from '~/components/common/ScrollHelperBottom';
import { Card } from '~/components/containers/Card';
import { Footer } from '~/components/main/Footer';
import { NodeTitle } from '~/components/node/NodeTitle';
import { Dialog } from '~/constants/modal';
import { Container } from '~/containers/main/Container';
import { SubmitBarRouter } from '~/containers/main/SubmitBarRouter';
import { NodeBottomBlock } from '~/containers/node/NodeBottomBlock';
import { useAuth } from '~/hooks/auth/useAuth';
import { useShowModal } from '~/hooks/modal/useShowModal';
import { useNodeActions } from '~/hooks/node/useNodeActions';
import { useNodeBlocks } from '~/hooks/node/useNodeBlocks';
import { useNodeCoverImage } from '~/hooks/node/useNodeCoverImage';
import { useNodePermissions } from '~/hooks/node/useNodePermissions';
import { useNodeContext } from '~/utils/context/NodeContextProvider';

import styles from './styles.module.scss';

const NodeLayout = observer(() => {
  const { isUser } = useAuth();
  const showRegisterDialog = useShowModal(Dialog.Register);
  const { node, isLoading, update } = useNodeContext();
  const { head, block } = useNodeBlocks(node, isLoading);
  const [canEdit, canLike, canStar] = useNodePermissions(node);
  const { onLike, onStar, onLock, onEdit } = useNodeActions(node, update);

  useNodeCoverImage(node);

  const onUnauthorizedLike = useCallback(() => showRegisterDialog({}), []);

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
              canLike={canLike || !isUser}
              canStar={canStar}
              onLike={isUser ? onLike : onUnauthorizedLike}
              onStar={onStar}
              onLock={onLock}
              onEdit={onEdit}
            />
          </div>

          <section>
            <NodeBottomBlock commentsOrder="DESC" />
          </section>

          <Footer />
        </Card>
      </Container>

      <SubmitBarRouter prefix="/post:id" isLab={!node.is_promoted} />

      <Superpower>
        <ScrollHelperBottom />
      </Superpower>
    </div>
  );
});

export { NodeLayout };
