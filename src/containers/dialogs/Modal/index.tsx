import React, { Attributes, FC, useCallback } from 'react';
import { connect } from 'react-redux';
import ReactDOM from 'react-dom';
import * as styles from './styles.scss';
import { IState } from '~/redux/store';
import * as ACTIONS from '~/redux/modal/actions';
import { DIALOG_CONTENT } from '~/constants/dialogs';

const mapStateToProps = ({ modal }: IState) => ({ ...modal });
const mapDispatchToProps = {
  modalSetShown: ACTIONS.modalSetShown,
  modalSetDialog: ACTIONS.modalSetDialog,
  modalShowDialog: ACTIONS.modalShowDialog,
};

type IProps = typeof mapDispatchToProps & ReturnType<typeof mapStateToProps> & {};

const ModalUnconnected: FC<IProps> = ({
  modalSetShown,
  modalSetDialog,
  modalShowDialog,
  is_shown,
  dialog,
}) => {
  const onRequestClose = useCallback(() => {
    modalSetShown(false);
    modalSetDialog(null);
  }, [modalSetShown, modalSetDialog]);

  if (!dialog || !DIALOG_CONTENT[dialog] || !is_shown) return null;

  return ReactDOM.createPortal(
    <div className={styles.fixed}>
      <div className={styles.overlay} onClick={onRequestClose} />
      <div className={styles.content}>
        {React.createElement(DIALOG_CONTENT[dialog], {
          onRequestClose,
          onDialogChange: modalShowDialog,
        })}
      </div>
    </div>,
    document.body
  );
};

const Modal = connect(
  mapStateToProps,
  mapDispatchToProps
)(ModalUnconnected);

export { ModalUnconnected, Modal };

/*

  <div className={styles.content_scroller}>
    <div className={styles.content_padder}>
    </div>
  </div>

*/
