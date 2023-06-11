import React, { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { Superpower } from '~/components/boris/Superpower';
import { ScrollHelperBottom } from '~/components/common/ScrollHelperBottom';
import { Card } from '~/components/containers/Card';
import { Footer } from '~/components/main/Footer';
import { NodeTitle } from '~/components/node/NodeTitle';
import { Container } from '~/containers/main/Container';
import { SidebarRouter } from '~/containers/main/SidebarRouter';
import { NodeBacklinks } from '~/containers/node/NodeBacklinks';
import { NodeBottomBlock } from '~/containers/node/NodeBottomBlock';
import { useNodeActions } from '~/hooks/node/useNodeActions';
import { useNodeBlocks } from '~/hooks/node/useNodeBlocks';
import { useNodeCoverImage } from '~/hooks/node/useNodeCoverImage';
import { useNodePermissions } from '~/hooks/node/useNodePermissions';
import { useNodeContext } from '~/utils/context/NodeContextProvider';

import styles from './styles.module.scss';

type IProps = {};

const NodeLayout: FC<IProps> = observer(() => {
  const { node, isLoading, update } = useNodeContext();
  const { head, block } = useNodeBlocks(node, isLoading);
  const [canEdit, canLike, canStar] = useNodePermissions(node);
  const { onLike, onStar, onLock, onEdit } = useNodeActions(node, update);

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
              onEdit={onEdit}
            />
          </div>

          <section>
            <NodeBottomBlock commentsOrder="DESC" />
          </section>

          <Footer />
        </Card>
      </Container>

      <SidebarRouter prefix="/post:id" />

      <Superpower>
        <ScrollHelperBottom />
      </Superpower>
    </div>
  );
});

export { NodeLayout };
