import React, { FC, createElement, useEffect, useCallback, useState, useMemo, memo } from 'react';
import { RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';
import { canEditNode, canLikeNode, canStarNode } from '~/utils/node';
import { selectNode } from '~/redux/node/selectors';
import { Card } from '~/components/containers/Card';

import { NodePanel } from '~/components/node/NodePanel';
import { Group } from '~/components/containers/Group';
import { Padder } from '~/components/containers/Padder';
import { NodeNoComments } from '~/components/node/NodeNoComments';
import { NodeRelated } from '~/components/node/NodeRelated';
import { NodeComments } from '~/components/node/NodeComments';
import { NodeTags } from '~/components/node/NodeTags';
import {
  NODE_COMPONENTS,
  NODE_INLINES,
  NODE_HEADS,
  INodeComponentProps,
} from '~/redux/node/constants';
import { selectUser } from '~/redux/auth/selectors';
import pick from 'ramda/es/pick';
import { NodeRelatedPlaceholder } from '~/components/node/NodeRelated/placeholder';
import { NodeDeletedBadge } from '~/components/node/NodeDeletedBadge';
import { NodeCommentForm } from '~/components/node/NodeCommentForm';
import { Sticky } from '~/components/containers/Sticky';
import { Footer } from '~/components/main/Footer';

import * as styles from './styles.scss';
import * as NODE_ACTIONS from '~/redux/node/actions';
import * as MODAL_ACTIONS from '~/redux/modal/actions';
import { IState } from '~/redux/store';
import { selectModal } from '~/redux/modal/selectors';

const mapStateToProps = (state: IState) => ({
  node: selectNode(state),
  user: selectUser(state),
  modal: pick(['is_shown'])(selectModal(state)),
});

const mapDispatchToProps = {
  nodeGotoNode: NODE_ACTIONS.nodeGotoNode,
  nodeUpdateTags: NODE_ACTIONS.nodeUpdateTags,
  nodeSetCoverImage: NODE_ACTIONS.nodeSetCoverImage,
  nodeEdit: NODE_ACTIONS.nodeEdit,
  nodeLike: NODE_ACTIONS.nodeLike,
  nodeStar: NODE_ACTIONS.nodeStar,
  nodeLock: NODE_ACTIONS.nodeLock,
  nodeLockComment: NODE_ACTIONS.nodeLockComment,
  nodeEditComment: NODE_ACTIONS.nodeEditComment,
  nodeLoadMoreComments: NODE_ACTIONS.nodeLoadMoreComments,
  modalShowPhotoswipe: MODAL_ACTIONS.modalShowPhotoswipe,
};

type IProps = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps &
  RouteComponentProps<{ id: string }> & {};

const NodeLayoutUnconnected: FC<IProps> = memo(
  ({
    match: {
      params: { id },
    },
    node: {
      is_loading,
      is_loading_comments,
      comments = [],
      current: node,
      related,
      comment_data,
      comment_count,
    },
    modal: { is_shown: is_modal_shown },
    user,
    user: { is_user },
    nodeGotoNode,
    nodeUpdateTags,
    nodeEdit,
    nodeLike,
    nodeStar,
    nodeLock,
    nodeSetCoverImage,
    nodeLockComment,
    nodeEditComment,
    nodeLoadMoreComments,
    modalShowPhotoswipe,
  }) => {
    const [layout, setLayout] = useState({});

    const updateLayout = useCallback(() => setLayout({}), []);

    useEffect(() => {
      if (is_loading) return;
      nodeGotoNode(parseInt(id, 10), null);
    }, [nodeGotoNode, id]);

    const onTagsChange = useCallback(
      (tags: string[]) => {
        nodeUpdateTags(node.id, tags);
      },
      [node, nodeUpdateTags]
    );

    const can_edit = useMemo(() => canEditNode(node, user), [node, user]);
    const can_like = useMemo(() => canLikeNode(node, user), [node, user]);
    const can_star = useMemo(() => canStarNode(node, user), [node, user]);

    const head = node && node.type && NODE_HEADS[node.type];
    const block = node && node.type && NODE_COMPONENTS[node.type];
    const inline = node && node.type && NODE_INLINES[node.type];

    const onEdit = useCallback(() => nodeEdit(node.id), [nodeEdit, node]);
    const onLike = useCallback(() => nodeLike(node.id), [nodeLike, node]);
    const onStar = useCallback(() => nodeStar(node.id), [nodeStar, node]);
    const onLock = useCallback(() => nodeLock(node.id, !node.deleted_at), [nodeStar, node]);

    const createNodeBlock = useCallback(
      (block: FC<INodeComponentProps>) =>
        block &&
        createElement(block, {
          node,
          is_loading,
          updateLayout,
          layout,
          modalShowPhotoswipe,
          is_modal_shown,
        }),
      [node, is_loading, updateLayout, layout, modalShowPhotoswipe, is_modal_shown]
    );

    useEffect(() => {
      if (!node.cover) return;
      nodeSetCoverImage(node.cover);
      return () => nodeSetCoverImage(null);
    }, [nodeSetCoverImage, node.cover]);

    return (
      <>
        {createNodeBlock(head)}

        <Card className={styles.node} seamless>
          {createNodeBlock(block)}

          <NodePanel
            node={pick(
              ['title', 'user', 'is_liked', 'is_heroic', 'deleted_at', 'created_at', 'like_count'],
              node
            )}
            layout={layout}
            can_edit={can_edit}
            can_like={can_like}
            can_star={can_star}
            onEdit={onEdit}
            onLike={onLike}
            onStar={onStar}
            onLock={onLock}
            is_loading={is_loading}
          />

          {node.deleted_at ? (
            <NodeDeletedBadge />
          ) : (
            <Group>
              <Padder>
                <Group horizontal className={styles.content}>
                  <Group className={styles.comments}>
                    {inline && <div className={styles.inline}>{createNodeBlock(inline)}</div>}

                    {is_loading || is_loading_comments || (!comments.length && !inline) ? (
                      <NodeNoComments is_loading={is_loading_comments || is_loading} />
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
                        order="DESC"
                      />
                    )}

                    {is_user && !is_loading && <NodeCommentForm />}
                  </Group>

                  <div className={styles.panel}>
                    <Sticky>
                      <Group style={{ flex: 1, minWidth: 0 }}>
                        {!is_loading && (
                          <NodeTags
                            is_editable={is_user}
                            tags={node.tags}
                            onChange={onTagsChange}
                          />
                        )}

                        {is_loading && <NodeRelatedPlaceholder />}

                        {!is_loading &&
                          related &&
                          related.albums &&
                          Object.keys(related.albums)
                            .filter(album => related.albums[album].length > 0)
                            .map(album => (
                              <NodeRelated
                                title={album}
                                items={related.albums[album]}
                                key={album}
                              />
                            ))}

                        {!is_loading &&
                          related &&
                          related.similar &&
                          related.similar.length > 0 && (
                            <NodeRelated title="ПОХОЖИЕ" items={related.similar} />
                          )}
                      </Group>
                    </Sticky>
                  </div>
                </Group>
              </Padder>
            </Group>
          )}

          <Footer />
        </Card>
      </>
    );
  }
);

const NodeLayout = connect(mapStateToProps, mapDispatchToProps)(NodeLayoutUnconnected);

export { NodeLayout, NodeLayoutUnconnected };
