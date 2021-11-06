import React, { FC, useCallback, useEffect } from 'react';
import { selectNode, selectNodeComments } from '~/redux/node/selectors';
import { selectAuthIsTester } from '~/redux/auth/selectors';
import { useDispatch } from 'react-redux';
import styles from './styles.module.scss';
import { Group } from '~/components/containers/Group';
import boris from '~/sprites/boris_robot.svg';
import { useRandomPhrase } from '~/constants/phrases';
import isBefore from 'date-fns/isBefore';
import { useShallowSelect } from '~/utils/hooks/useShallowSelect';
import { selectBorisStats } from '~/redux/boris/selectors';
import { authSetState, authSetUser } from '~/redux/auth/actions';
import { nodeLoadNode } from '~/redux/node/actions';
import { borisLoadStats } from '~/redux/boris/actions';
import { Container } from '~/containers/main/Container';
import StickyBox from 'react-sticky-box/dist/esnext';
import { BorisComments } from '~/components/boris/BorisComments';
import { Card } from '~/components/containers/Card';
import { SidebarRouter } from '~/containers/main/SidebarRouter';
import { BorisSidebar } from '~/components/boris/BorisSidebar';
import { useImageModal } from '~/utils/hooks/useImageModal';
import { useNodeComments } from '~/utils/hooks/node/useNodeComments';
import { useUser } from '~/utils/hooks/user/userUser';

type IProps = {};

const BorisLayout: FC<IProps> = () => {
  const title = useRandomPhrase('BORIS_TITLE');
  const dispatch = useDispatch();
  const node = useShallowSelect(selectNode);
  const stats = useShallowSelect(selectBorisStats);
  const comments = useShallowSelect(selectNodeComments);
  const isTester = useShallowSelect(selectAuthIsTester);
  const user = useUser();

  useEffect(() => {
    const last_comment = comments[0];

    if (!last_comment) return;

    if (
      user.last_seen_boris &&
      last_comment.created_at &&
      !isBefore(new Date(user.last_seen_boris), new Date(last_comment.created_at))
    )
      return;

    dispatch(authSetUser({ last_seen_boris: last_comment.created_at }));
  }, [user.last_seen_boris, dispatch, comments]);

  useEffect(() => {
    if (node.is_loading) return;
    dispatch(nodeLoadNode(696, 'DESC'));
  }, [dispatch]);

  useEffect(() => {
    dispatch(borisLoadStats());
  }, [dispatch]);

  const setBetaTester = useCallback(
    (is_tester: boolean) => {
      dispatch(authSetState({ is_tester }));
    },
    [dispatch]
  );

  const onShowImageModal = useImageModal();
  const { onLoadMoreComments, onDelete: onDeleteComment } = useNodeComments(696);

  return (
    <Container>
      <div className={styles.wrap}>
        <div className={styles.cover} />

        <div className={styles.image}>
          <div className={styles.caption}>
            <div className={styles.caption_text}>{title}</div>
          </div>

          <img src={boris} alt="Борис" />
        </div>

        <div className={styles.container}>
          <Card className={styles.content}>
            <BorisComments
              node={node.current}
              user={user}
              comments={node.comments}
              commentCount={node.comment_count}
              isLoadingComments={node.is_loading_comments}
              onLoadMoreComments={onLoadMoreComments}
              onShowImageModal={onShowImageModal}
              onDeleteComment={onDeleteComment}
            />
          </Card>

          <Group className={styles.stats}>
            <StickyBox className={styles.sticky} offsetTop={72} offsetBottom={10}>
              <BorisSidebar
                isTester={isTester}
                stats={stats}
                setBetaTester={setBetaTester}
                user={user}
              />
            </StickyBox>
          </Group>
        </div>
      </div>

      <SidebarRouter prefix="/" />
    </Container>
  );
};

export { BorisLayout };
