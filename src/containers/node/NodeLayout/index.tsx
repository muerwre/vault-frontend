import React, { FC, createElement, useEffect } from 'react';
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
import { NODE_COMPONENTS } from '~/redux/node/constants';
import * as NODE_ACTIONS from '~/redux/node/actions';
import { CommentForm } from '~/components/node/CommentForm';

const mapStateToProps = selectNode;
const mapDispatchToProps = {
  nodeLoadNode: NODE_ACTIONS.nodeLoadNode,
};

type IProps = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps &
  RouteComponentProps<{ id: string }> & {};

const NodeLayoutUnconnected: FC<IProps> = ({
  match: {
    params: { id },
  },
  is_loading,
  is_loading_comments,
  comments = [],
  current: node,
  nodeLoadNode,
}) => {
  useEffect(() => {
    if (is_loading) return;
    nodeLoadNode(id, null);
  }, []);

  const block = node && node.type && NODE_COMPONENTS[node.type] && NODE_COMPONENTS[node.type];

  return (
    <Card className={styles.node} seamless>
      {block && createElement(block, { node, is_loading })}

      <NodePanel />

      <Group>
        <Padder>
          <Group horizontal className={styles.content}>
            <Group className={styles.comments}>
              <CommentForm id={node.id || null} />

              {is_loading_comments || !comments.length || true ? (
                <NodeNoComments is_loading={is_loading_comments} />
              ) : (
                <NodeComments />
              )}
            </Group>

            <div className={styles.panel}>
              <Group style={{ flex: 1 }}>
                <NodeTags />

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
