import React, { FC, useCallback } from 'react';
import { connect } from 'react-redux';
import { Icon } from '~/components/input/Icon';
import * as NODE_ACTIONS from '~/redux/node/actions';
import { DIALOGS } from '~/redux/modal/constants';

import * as styles from './styles.scss';
import { NODE_TYPES } from '~/redux/node/constants';

const mapStateToProps = null;
const mapDispatchToProps = {
  nodeCreate: NODE_ACTIONS.nodeCreate,
  // showDialog: MODAL_ACTIONS.modalShowDialog,
};

type IProps = typeof mapDispatchToProps & {};

const SubmitBarUnconnected: FC<IProps> = ({ nodeCreate }) => {
  const onOpenImageEditor = useCallback(() => nodeCreate(NODE_TYPES.IMAGE), [nodeCreate]);
  const onOpenTextEditor = useCallback(() => nodeCreate(NODE_TYPES.TEXT), [nodeCreate]);
  const onOpenVideoEditor = useCallback(() => nodeCreate(NODE_TYPES.VIDEO), [nodeCreate]);
  const onOpenAudioEditor = useCallback(() => nodeCreate(NODE_TYPES.AUDIO), [nodeCreate]);

  return (
    <div className={styles.wrap}>
      <div className={styles.panel}>
        <div onClick={onOpenImageEditor}>
          <Icon icon="image" />
        </div>

        <div onClick={onOpenTextEditor}>
          <Icon icon="text" />
        </div>

        <div onClick={onOpenVideoEditor}>
          <Icon icon="video" />
        </div>

        <div onClick={onOpenAudioEditor}>
          <Icon icon="audio" />
        </div>
      </div>

      <div className={styles.button}>
        <Icon icon="plus" />
      </div>
    </div>
  );
};

const SubmitBar = connect(
  mapStateToProps,
  mapDispatchToProps
)(SubmitBarUnconnected);

export { SubmitBar };
