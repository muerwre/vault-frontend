import { FC, Fragment } from 'react';

import classNames from 'classnames';
import { observer } from 'mobx-react-lite';

import { flowDisplayToPreset, URLS } from '~/constants/urls';
import { useAuth } from '~/hooks/auth/useAuth';
import { FlowDisplay, IFlowNode, INode } from '~/types';
import { IUser } from '~/types/auth';
import { getURLFromString } from '~/utils/dom';
import { canEditNode } from '~/utils/node';

import { FlowCell } from './components/FlowCell';
import styles from './styles.module.scss';

interface Props {
  nodes: IFlowNode[];
  user: Partial<IUser>;
  onChangeCellView: (id: INode['id'], flow: FlowDisplay) => void;
}

export const FlowGrid: FC<Props> = observer(
  ({ user, nodes, onChangeCellView }) => {
    const { fetched, isUser } = useAuth();

    if (!nodes) {
      return null;
    }

    return (
      <Fragment>
        {nodes.map((node) => (
          <div
            className={classNames(styles.cell, styles[node.flow.display])}
            key={node.id}
          >
            <FlowCell
              id={node.id}
              color={node.flow.dominant_color}
              to={URLS.NODE_URL(node.id)}
              image={getURLFromString(
                node.thumbnail,
                flowDisplayToPreset[node.flow.display],
              )}
              flow={node.flow}
              text={node.description}
              title={node.title}
              canEdit={fetched && isUser && canEditNode(node, user)}
              onChangeCellView={onChangeCellView}
            />
          </div>
        ))}
      </Fragment>
    );
  },
);
