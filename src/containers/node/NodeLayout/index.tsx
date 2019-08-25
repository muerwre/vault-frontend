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
  current: node,
  nodeLoadNode,
}) => {
  useEffect(() => {
    if (is_loading) return;
    nodeLoadNode(id, null);
    // todo: if node not loading, load it!
  }, []);

  useEffect(() => console.log({ is_loading }), [is_loading]);

  const block = node && node.type && NODE_COMPONENTS[node.type] && NODE_COMPONENTS[node.type];
  // const view = block && block[is_loading ? 'placeholder' : 'component'];
  // console.log({ block, view });

  return (
    <Card className={styles.node} seamless>
      {block && createElement(block, { node, is_loading })}

      <NodePanel />

      <Group>
        <Padder>
          <Group horizontal className={styles.content}>
            <Group className={styles.comments}>
              <NodeNoComments />
              <NodeComments />
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
