import React, { FC, Fragment } from 'react';

import classNames from 'classnames';

import { FlowCell } from '~/components/flow/FlowCell';
import { PRESETS, URLS } from '~/constants/urls';
import { FlowDisplay, IFlowNode, INode } from '~/types';
import { IUser } from '~/types/auth';
import { getURLFromString } from '~/utils/dom';
import { canEditNode } from '~/utils/node';

import styles from './styles.module.scss';

interface Props {
  nodes: IFlowNode[];
  user: Partial<IUser>;
  onChangeCellView: (id: INode['id'], flow: FlowDisplay) => void;
}

export const FlowGrid: FC<Props> = ({ user, nodes, onChangeCellView }) => {
  if (!nodes) {
    return null;
  }

  return (
    <Fragment>
      {nodes.map(node => (
        <div className={classNames(styles.cell, styles[node.flow.display])} key={node.id}>
          <FlowCell
            id={node.id}
            color={node.flow.dominant_color}
            to={URLS.NODE_URL(node.id)}
            image={getURLFromString(node.thumbnail, PRESETS.cover)}
            flow={node.flow}
            text={node.description}
            title={node.title}
            canEdit={canEditNode(node, user)}
            onChangeCellView={onChangeCellView}
          />
        </div>
      ))}
    </Fragment>
  );
};
