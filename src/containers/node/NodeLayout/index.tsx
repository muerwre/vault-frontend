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
import * as styles from './styles.scss';
import { NodeComments } from '~/components/node/NodeComments';
import { NodeTags } from '~/components/node/NodeTags';
import { NODE_COMPONENTS, NODE_INLINES } from '~/redux/node/constants';
import * as NODE_ACTIONS from '~/redux/node/actions';
import { CommentForm } from '~/components/node/CommentForm';
import { selectUser } from '~/redux/auth/selectors';
import pick from 'ramda/es/pick';
import { NodeRelatedPlaceholder } from '~/components/node/NodeRelated/placeholder';

const mapStateToProps = state => ({
  node: selectNode(state),
  user: selectUser(state),
});

const mapDispatchToProps = {
  nodeGotoNode: NODE_ACTIONS.nodeGotoNode,
  nodeUpdateTags: NODE_ACTIONS.nodeUpdateTags,
  nodeSetCoverImage: NODE_ACTIONS.nodeSetCoverImage,
  nodeEdit: NODE_ACTIONS.nodeEdit,
  nodeLike: NODE_ACTIONS.nodeLike,
  nodeStar: NODE_ACTIONS.nodeStar,
};

type IProps = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps &
  RouteComponentProps<{ id: string }> & {};

const NodeLayoutUnconnected: FC<IProps> = memo(
  ({
    match: {
      params: { id },
    },
    node: { is_loading, is_loading_comments, comments = [], current: node, related },
    user,
    user: { is_user },
    nodeGotoNode,
    nodeUpdateTags,
    nodeEdit,
    nodeLike,
    nodeStar,
    nodeSetCoverImage,
  }) => {
    // const is_loading = true;

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

    const block = node && node.type && NODE_COMPONENTS[node.type];
    const inline_block = node && node.type && NODE_INLINES[node.type];

    const onEdit = useCallback(() => nodeEdit(node.id), [nodeEdit, node]);
    const onLike = useCallback(() => nodeLike(node.id), [nodeLike, node]);
    const onStar = useCallback(() => nodeStar(node.id), [nodeStar, node]);

    useEffect(() => {
      if (!node.cover) return;
      nodeSetCoverImage(node.cover);
      return () => nodeSetCoverImage(null);
    }, [nodeSetCoverImage, node.cover]);

    return (
      <Card className={styles.node} seamless>
        {block && createElement(block, { node, is_loading, updateLayout, layout })}

        <NodePanel
          node={pick(['title', 'user', 'is_liked', 'is_heroic'], node)}
          layout={layout}
          can_edit={can_edit}
          can_like={can_like}
          can_star={can_star}
          onEdit={onEdit}
          onLike={onLike}
          onStar={onStar}
          is_loading={is_loading}
        />

        <Group>
          <Padder>
            <Group horizontal className={styles.content}>
              <Group className={styles.comments}>
                {inline_block && (
                  <div className={styles.inline_block}>
                    {createElement(inline_block, {
                      node,
                      is_loading,
                      updateLayout,
                      layout,
                    })}
                  </div>
                )}

                {is_loading || is_loading_comments || (!comments.length && !inline_block) ? (
                  <NodeNoComments is_loading={is_loading_comments || is_loading} />
                ) : (
                  <NodeComments comments={comments} />
                )}

                {is_user && !is_loading && <CommentForm id={0} />}
              </Group>

              <div className={styles.panel}>
                <Group style={{ flex: 1, minWidth: 0 }}>
                  {!is_loading && (
                    <NodeTags is_editable={is_user} tags={node.tags} onChange={onTagsChange} />
                  )}

                  {is_loading && <NodeRelatedPlaceholder />}

                  {!is_loading &&
                    related &&
                    related.albums &&
                    Object.keys(related.albums)
                      .filter(album => related.albums[album].length > 0)
                      .map(album => (
                        <NodeRelated title={album} items={related.albums[album]} key={album} />
                      ))}

                  {!is_loading && related && related.similar && related.similar.length > 0 && (
                    <NodeRelated title="ПОХОЖИЕ" items={related.similar} />
                  )}
                </Group>
              </div>
            </Group>
          </Padder>
        </Group>
      </Card>
    );
  }
);

const NodeLayout = connect(
  mapStateToProps,
  mapDispatchToProps
)(NodeLayoutUnconnected);

export { NodeLayout, NodeLayoutUnconnected };
