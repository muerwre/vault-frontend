import { CSSProperties, useCallback, useEffect, useRef, useState } from 'react';

import { observer } from 'mobx-react-lite';

import { Card } from '~/components/common/Card';
import { Container } from '~/components/common/Container';
import { Footer } from '~/components/common/Footer';
import { NodeTitle } from '~/components/node/NodeTitle';
import { Dialog } from '~/constants/modal/dialog';
import { SubmitBarRouter } from '~/containers/main/SubmitBarRouter';
import { NodeBottomBlock } from '~/containers/node/NodeBottomBlock';
import { useAskToLogIn } from '~/hooks/auth/useAskToLogIn';
import { useAuth } from '~/hooks/auth/useAuth';
import { useShowModal } from '~/hooks/modal/useShowModal';
import { useNodeActions } from '~/hooks/node/useNodeActions';
import { useNodeAudios } from '~/hooks/node/useNodeAudios';
import { useNodeImages } from '~/hooks/node/useNodeImages';
import { useNodePermissions } from '~/hooks/node/useNodePermissions';
import { useNodeContext } from '~/utils/context/NodeContextProvider';
import { isLabNode } from '~/utils/node';

import { AuraBackdrop } from './components/AuraBackdrop';
import { AuraPlayButton } from './components/AuraPlayButton';
import styles from './styles.module.scss';

/**
 * A song node shown as an aura: its photos slide behind the page, and the
 * post itself starts low enough that only its title shows above the fold.
 * The songs are played from the stage, so the body leaves them out.
 */
const NodeAuraLayout = observer(() => {
  const { isUser } = useAuth();
  const showRegisterDialog = useShowModal(Dialog.Register);
  const askToLogIn = useAskToLogIn('song');
  const { node, isLoading, update } = useNodeContext();
  const [canEdit, canLike, canStar] = useNodePermissions(node);
  const { onLike, onStar, onPin, onLock, onEdit } = useNodeActions(
    node,
    update,
  );
  const images = useNodeImages(node);
  const audios = useNodeAudios(node);

  // the title wraps on narrow screens, so its height is measured, not assumed
  const titleRef = useRef<HTMLDivElement>(null);
  const [titleHeight, setTitleHeight] = useState<number>();

  useEffect(() => {
    const element = titleRef.current;

    if (!element || typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(([entry]) =>
      setTitleHeight(entry.target.getBoundingClientRect().height),
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const onUnauthorizedLike = useCallback(() => {
    umami.track('register-dialog-from-like');
    showRegisterDialog({});
  }, [showRegisterDialog]);

  const style = titleHeight
    ? ({ '--aura-title-height': `${titleHeight}px` } as CSSProperties)
    : undefined;

  return (
    <div className={styles.wrap} style={style}>
      <AuraBackdrop images={images} />

      <div className={styles.stage}>
        <AuraPlayButton
          audios={audios}
          nodeTitle={node.title}
          onDisabledPlayPress={askToLogIn}
        />
      </div>

      <Container className={styles.content}>
        <Card className={styles.node} seamless>
          <div className={styles.panel} ref={titleRef}>
            <NodeTitle
              id={node.id}
              title={node.title}
              username={node.user?.username}
              likeCount={node?.like_count || 0}
              isHeroic={!!node.is_heroic}
              isPinned={!!node.is_pinned}
              isLiked={!!node.is_liked}
              isLocked={!!node.deleted_at}
              isLoading={isLoading}
              createdAt={node.created_at || ''}
              canEdit={canEdit}
              canLike={canLike || !isUser}
              canStar={canStar}
              onLike={isUser ? onLike : onUnauthorizedLike}
              onStar={onStar}
              canPin={canEdit}
              onPin={onPin}
              onLock={onLock}
              onEdit={onEdit}
            />
          </div>

          <section>
            <NodeBottomBlock commentsOrder="DESC" withInline={false} />
          </section>

          <Footer />
        </Card>
      </Container>

      <SubmitBarRouter prefix="/post:id" isLab={isLabNode(node)} />
    </div>
  );
});

export { NodeAuraLayout };
