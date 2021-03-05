import React, { createElement, FC, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { RouteComponentProps, useHistory } from 'react-router';
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
  INodeComponentProps,
  NODE_COMPONENTS,
  NODE_HEADS,
  NODE_INLINES,
} from '~/redux/node/constants';
import { selectUser } from '~/redux/auth/selectors';
import { path, pick, prop } from 'ramda';
import { NodeRelatedPlaceholder } from '~/components/node/NodeRelated/placeholder';
import { NodeDeletedBadge } from '~/components/node/NodeDeletedBadge';
import { NodeCommentForm } from '~/components/node/NodeCommentForm';
import { Sticky } from '~/components/containers/Sticky';
import { Footer } from '~/components/main/Footer';
import { Link } from 'react-router-dom';

import styles from './styles.module.scss';
import * as NODE_ACTIONS from '~/redux/node/actions';
import * as MODAL_ACTIONS from '~/redux/modal/actions';
import { IState } from '~/redux/store';
import { selectModal } from '~/redux/modal/selectors';
import { SidebarRouter } from '~/containers/main/SidebarRouter';
import { ITag } from '~/redux/types';
import { URLS } from '~/constants/urls';
import { useShallowSelect } from '~/utils/hooks/useShallowSelect';

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
    modalShowPhotoswipe,
  }) => {
    const [layout, setLayout] = useState({});
    const history = useHistory();
    const {
      is_loading,
      is_loading_comments,
      comments = [],
      current: node,
      related,
      comment_count,
    } = useShallowSelect(selectNode);
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

    const onTagClick = useCallback(
      (tag: Partial<ITag>) => {
        if (!node?.id || !tag?.title) {
          return;
        }

        history.push(URLS.NODE_TAG_URL(node.id, encodeURIComponent(tag.title)));
      },
      [history, node.id]
    );

    const can_edit = useMemo(() => canEditNode(node, user), [node, user]);
    const can_like = useMemo(() => canLikeNode(node, user), [node, user]);
    const can_star = useMemo(() => canStarNode(node, user), [node, user]);

    const head = useMemo(() => node?.type && prop(node?.type, NODE_HEADS), [node.type]);
    const block = useMemo(() => node?.type && prop(node?.type, NODE_COMPONENTS), [node.type]);
    const inline = useMemo(() => node?.type && prop(node?.type, NODE_INLINES), [node.type]);

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

    useEffect(() => {
      window.scrollTo(0, 0);
    }, [id]);

    return (
      <>
        {!!head && createNodeBlock(head)}

        <Card className={styles.node} seamless>
          {!!block && createNodeBlock(block)}

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
                        count={comment_count}
                        comments={comments}
                        user={user}
                        order="DESC"
                      />
                    )}

                    {is_user && !is_loading && <NodeCommentForm nodeId={node.id} />}
                  </Group>

                  <div className={styles.panel}>
                    <Sticky>
                      <Group style={{ flex: 1, minWidth: 0 }}>
                        {!is_loading && (
                          <NodeTags
                            is_editable={is_user}
                            tags={node.tags}
                            onChange={onTagsChange}
                            onTagClick={onTagClick}
                          />
                        )}

                        {is_loading && <NodeRelatedPlaceholder />}

                        {!is_loading &&
                          related &&
                          related.albums &&
                          !!node?.id &&
                          Object.keys(related.albums)
                            .filter(album => related.albums[album].length > 0)
                            .map(album => (
                              <NodeRelated
                                title={
                                  <Link to={URLS.NODE_TAG_URL(node.id!, encodeURIComponent(album))}>
                                    {album}
                                  </Link>
                                }
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

        <SidebarRouter prefix="/post:id" />
      </>
    );
  }
);

const NodeLayout = connect(mapStateToProps, mapDispatchToProps)(NodeLayoutUnconnected);

export { NodeLayout, NodeLayoutUnconnected };
