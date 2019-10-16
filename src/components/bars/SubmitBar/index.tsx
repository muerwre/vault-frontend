import React, { FC, useCallback } from 'react';
import { connect } from 'react-redux';
import { Icon } from '~/components/input/Icon';
import * as MODAL_ACTIONS from '~/redux/modal/actions';
import { DIALOGS } from '~/redux/modal/constants';

import * as styles from './styles.scss';

const mapStateToProps = null;
const mapDispatchToProps = {
  showDialog: MODAL_ACTIONS.modalShowDialog,
};

type IProps = typeof mapDispatchToProps & {};

const SubmitBarUnconnected: FC<IProps> = ({ showDialog }) => {
  const onOpenImageEditor = useCallback(() => showDialog(DIALOGS.EDITOR_IMAGE), [showDialog]);

  return (
    <div className={styles.wrap}>
      <div className={styles.panel}>
        <div onClick={onOpenImageEditor}>
          <Icon icon="image" />
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
