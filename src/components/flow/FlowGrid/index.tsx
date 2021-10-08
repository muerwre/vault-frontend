import React, { FC, Fragment } from 'react';

import { IFlowState } from '~/redux/flow/reducer';
import { INode } from '~/redux/types';
import { IUser } from '~/redux/auth/types';
import { PRESETS, URLS } from '~/constants/urls';
import { FlowCell } from '~/components/flow/FlowCell';
import classNames from 'classnames';
import styles from './styles.module.scss';
import { getURLFromString } from '~/utils/dom';

type IProps = Partial<IFlowState> & {
  user: Partial<IUser>;
  onChangeCellView: (id: INode['id'], flow: INode['flow']) => void;
};

export const FlowGrid: FC<IProps> = ({ user, nodes, onChangeCellView }) => {
  if (!nodes) {
    return null;
  }

  return (
    <Fragment>
      {nodes.map(node => (
        <div className={classNames(styles.cell, styles[node.flow.display])} key={node.id}>
          <FlowCell
            color={node.flow.dominant_color}
            to={URLS.NODE_URL(node.id)}
            image={getURLFromString(node.thumbnail, PRESETS.cover)}
            display={node.flow.display}
            text={node.flow.show_description ? node.description : ''}
            title={node.title}
          />
        </div>
      ))}
    </Fragment>
  );
};
