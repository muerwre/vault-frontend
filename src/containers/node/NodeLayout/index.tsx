import React, { FC, createElement } from 'react';
import { RouteComponentProps } from 'react-router';
import range from 'ramda/es/range';
import { selectNode } from '~/redux/node/selectors';
import { Card } from '~/components/containers/Card';
import { ImageSwitcher } from '~/components/node/ImageSwitcher';
import { NodePanel } from '~/components/node/NodePanel';
import { Group } from '~/components/containers/Group';
import { Padder } from '~/components/containers/Padder';
import { NodeNoComments } from '~/components/node/NodeNoComments';
import { Comment } from '~/components/node/Comment';

import { Tags } from '~/components/node/Tags';
import { NodeRelated } from '~/components/node/NodeRelated';
import * as styles from './styles.scss';
import { NodeComments } from '~/components/node/NodeComments';
import { NodeTags } from '~/components/node/NodeTags';
import { NodeImageBlockPlaceholder } from '~/components/node/NodeImageBlockPlaceholder';
import { NODE_COMPONENTS } from '~/redux/node/constants';

const mapStateToProps = selectNode;
const mapDispatchToProps = {};

type IProps = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps &
  RouteComponentProps<{ id: string }> & {};

const NodeLayout: FC<IProps> = ({
  match: {
    params: { id },
  },
  is_loading,
  current: node,
}) => {
  const block = node && node.type && NODE_COMPONENTS[node.type] && NODE_COMPONENTS[node.type];
  const view = block && block[is_loading ? 'placeholder' : 'component'];

  return (
    <Card className={styles.node} seamless>
      {view && createElement(view, { node })}

      <NodeImageBlockPlaceholder />

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

export { NodeLayout };
