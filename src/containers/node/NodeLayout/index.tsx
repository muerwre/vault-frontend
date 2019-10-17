import React, { FC, createElement, useEffect, useCallback, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';

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

const mapStateToProps = state => ({
  node: selectNode(state),
  user: selectUser(state),
});

const mapDispatchToProps = {
  nodeLoadNode: NODE_ACTIONS.nodeLoadNode,
  nodeUpdateTags: NODE_ACTIONS.nodeUpdateTags,
};

type IProps = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps &
  RouteComponentProps<{ id: string }> & {};

const NodeLayoutUnconnected: FC<IProps> = ({
  match: {
    params: { id },
  },
  node: { is_loading, is_loading_comments, comments = [], current: node },
  user: { is_user },
  nodeLoadNode,
  nodeUpdateTags,
}) => {
  const [layout, setLayout] = useState({});

  const updateLayout = useCallback(() => setLayout({}), []);

  useEffect(() => {
    if (is_loading) return;
    nodeLoadNode(parseInt(id, 10), null);
  }, [nodeLoadNode, id]);

  const onTagsChange = useCallback(
    (tags: string[]) => {
      nodeUpdateTags(node.id, tags);
    },
    [node, nodeUpdateTags]
  );

  const block = node && node.type && NODE_COMPONENTS[node.type];
  const inline_block = node && node.type && NODE_INLINES[node.type];

  return (
    <Card className={styles.node} seamless>
      {block && createElement(block, { node, is_loading, updateLayout, layout })}

      <NodePanel node={node} layout={layout} />

      <Group>
        <Padder>
          <Group horizontal className={styles.content}>
            <Group className={styles.comments}>
              {inline_block && (
                <div className={styles.inline_block}>
                  {createElement(inline_block, { node, is_loading, updateLayout, layout })}
                </div>
              )}

              {is_loading_comments || !comments.length ? (
                <NodeNoComments is_loading={is_loading_comments} />
              ) : (
                <NodeComments comments={comments} />
              )}

              {is_user && <CommentForm id={0} />}
            </Group>

            <div className={styles.panel}>
              <Group style={{ flex: 1, minWidth: 0 }}>
                <NodeTags is_editable={is_user} tags={node.tags} onChange={onTagsChange} />

                <NodeRelated title="First album" />

                <NodeRelated title="Second album" />
              </Group>
            </div>
          </Group>
        </Padder>
      </Group>
    </Card>
  );
};

const NodeLayout = connect(
  mapStateToProps,
  mapDispatchToProps
)(NodeLayoutUnconnected);

export { NodeLayout, NodeLayoutUnconnected };
