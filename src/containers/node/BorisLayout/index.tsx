import React, { FC, useEffect } from 'react';
import { RouteComponentProps } from 'react-router';
import { selectNode } from '~/redux/node/selectors';
import { selectUser } from '~/redux/auth/selectors';
import { connect } from 'react-redux';
import { NodeComments } from '~/components/node/NodeComments';
import styles from './styles.scss';
import { Group } from '~/components/containers/Group';
import boris from '~/sprites/boris_robot.svg';
import { NodeNoComments } from '~/components/node/NodeNoComments';
import { getRandomPhrase } from '~/constants/phrases';
import { NodeCommentForm } from '~/components/node/NodeCommentForm';

import * as NODE_ACTIONS from '~/redux/node/actions';
import * as AUTH_ACTIONS from '~/redux/auth/actions';
import * as MODAL_ACTIONS from '~/redux/modal/actions';
import * as BORIS_ACTIONS from '~/redux/boris/actions';
import isBefore from 'date-fns/isBefore';
import { Card } from '~/components/containers/Card';
import { Footer } from '~/components/main/Footer';
import { Sticky } from '~/components/containers/Sticky';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { selectBorisStats } from '~/redux/boris/selectors';

const mapStateToProps = state => ({
  node: selectNode(state),
  user: selectUser(state),
  stats: selectBorisStats(state),
});

const mapDispatchToProps = {
  nodeLoadNode: NODE_ACTIONS.nodeLoadNode,
  nodeLockComment: NODE_ACTIONS.nodeLockComment,
  nodeEditComment: NODE_ACTIONS.nodeEditComment,
  nodeLoadMoreComments: NODE_ACTIONS.nodeLoadMoreComments,
  authSetUser: AUTH_ACTIONS.authSetUser,
  modalShowPhotoswipe: MODAL_ACTIONS.modalShowPhotoswipe,
  borisLoadStats: BORIS_ACTIONS.borisLoadStats,
};

type IProps = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps &
  RouteComponentProps<{ id: string }> & {};

const id = 696;

const BorisLayoutUnconnected: FC<IProps> = ({
  node: { is_loading, is_loading_comments, comments = [], comment_data, comment_count },
  user,
  user: { is_user, last_seen_boris },
  nodeLoadNode,
  nodeLockComment,
  nodeEditComment,
  nodeLoadMoreComments,
  modalShowPhotoswipe,
  authSetUser,
  borisLoadStats,
  stats,
}) => {
  const title = getRandomPhrase('BORIS_TITLE');

  useEffect(() => {
    const last_comment = comments[0];
    if (!last_comment) return;
    if (last_seen_boris && !isBefore(new Date(last_seen_boris), new Date(last_comment.created_at)))
      return;

    authSetUser({ last_seen_boris: last_comment.created_at });
  }, [comments, last_seen_boris]);

  useEffect(() => {
    if (is_loading) return;
    nodeLoadNode(id, 'DESC');
  }, [nodeLoadNode, id]);

  useEffect(() => {
    borisLoadStats();
  }, [borisLoadStats]);

  return (
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
          <Group className={styles.grid}>
            {is_user && <NodeCommentForm is_before />}

            {is_loading_comments ? (
              <NodeNoComments is_loading />
            ) : (
              <NodeComments
                comments={comments}
                comment_data={comment_data}
                comment_count={comment_count}
                user={user}
                onDelete={nodeLockComment}
                onEdit={nodeEditComment}
                onLoadMore={nodeLoadMoreComments}
                modalShowPhotoswipe={modalShowPhotoswipe}
                order="ASC"
              />
            )}
          </Group>

          <Footer />
        </Card>

        <Group className={styles.stats}>
          <Sticky>
            <Group className={styles.stats__container}>
              <div className={styles.stats__about}>
                <p>Здесь мы сидим и слушаем всё, что вас беспокоит.</p>
                <p>Все виновные будут наказаны. Невиновные, впрочем, тоже. Такова жизнь.</p>
              </div>

              {/*
                <div className={styles.stats__title}>Контент</div>

              <Placeholder width="35%" />
              <Placeholder width="40%" />
              <Placeholder width="35%" />
              <Placeholder width="20%" />

              <div className={styles.stats__title}>Хранилище</div>

              <Placeholder width="35%" />
              <Placeholder width="35%" />
              <Placeholder width="40%" />
                */}

              <div className={styles.stats__title}>Изменения</div>

              <Placeholder width="50%" />
              <Placeholder width="100%" />
              <Placeholder width="50%" />
              <Placeholder width="70%" />
              <Placeholder width="60%" />
              <Placeholder width="100%" />
            </Group>
          </Sticky>
        </Group>
      </div>
    </div>
  );
};

const BorisLayout = connect(mapStateToProps, mapDispatchToProps)(BorisLayoutUnconnected);

export { BorisLayout };
