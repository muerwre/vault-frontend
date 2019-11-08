import React, { FC, useEffect } from 'react';
import { RouteComponentProps } from 'react-router';
import * as NODE_ACTIONS from '~/redux/node/actions';
import { selectNode } from '~/redux/node/selectors';
import { selectUser } from '~/redux/auth/selectors';
import { connect } from 'react-redux';
import { NodeComments } from '~/components/node/NodeComments';
import styles from './styles.scss';
import { CommentForm } from '~/components/node/CommentForm';
import { Filler } from '~/components/containers/Filler';
import { Group } from '~/components/containers/Group';
import { GodRays } from '~/components/main/GodRays';

const mapStateToProps = state => ({
  node: selectNode(state),
  user: selectUser(state),
});

const mapDispatchToProps = {
  nodeLoadNode: NODE_ACTIONS.nodeLoadNode,
  nodeUpdateTags: NODE_ACTIONS.nodeUpdateTags,
  nodeSetCoverImage: NODE_ACTIONS.nodeSetCoverImage,
  nodeEdit: NODE_ACTIONS.nodeEdit,
  nodeLike: NODE_ACTIONS.nodeLike,
  nodeStar: NODE_ACTIONS.nodeStar,
};

type IProps = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps &
  RouteComponentProps<{ id: string }> & {};

const id = 696;

const BorisLayoutUnconnected: FC<IProps> = ({
  node: { is_loading, is_loading_comments, comments = [], current: node, related },
  user: { is_user },
  nodeLoadNode,
}) => {
  useEffect(() => {
    if (is_loading) return;
    nodeLoadNode(id, 'DESC');
  }, [nodeLoadNode, id]);

  return (
    <div className={styles.wrap}>
      <div className={styles.cover} />
      <div className={styles.column}>
        <div className={styles.daygrid}>
          <div className={styles.label}>Убежищу сегодня:</div>
          <div className={styles.day}>10</div>
          <div>лет</div>
          <div className={styles.day}>2</div>
          <div>месяца</div>

          <div className={styles.line} />

          <div className={styles.label}>Мы собрали:</div>
          <div className={styles.day}>2374</div>
          <div>поста</div>
          <div className={styles.day}>14765</div>
          <div>комментариев</div>
          <div className={styles.day}>4260</div>
          <div>файла</div>
          <div className={styles.day}>54</div>
          <div>жителя</div>
        </div>
      </div>

      <Group className={styles.container}>
        {is_user && <CommentForm id={0} />}

        <NodeComments comments={comments} />
      </Group>
    </div>
  );
};

const BorisLayout = connect(
  mapStateToProps,
  mapDispatchToProps
)(BorisLayoutUnconnected);

export { BorisLayout };
