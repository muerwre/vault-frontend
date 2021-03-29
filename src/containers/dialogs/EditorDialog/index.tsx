import React, { createElement, FC, useCallback, useMemo } from 'react';
import { IDialogProps } from '~/redux/modal/constants';
import styles from './styles.module.scss';
import { NODE_EDITORS } from '~/redux/node/constants';
import { BetterScrollDialog } from '../BetterScrollDialog';
import { CoverBackdrop } from '~/components/containers/CoverBackdrop';
import { prop } from 'ramda';
import { useNodeFormFormik } from '~/utils/hooks/useNodeFormFormik';
import { EditorButtons } from '~/components/editors/EditorButtons';
import { FileUploaderProvider, useFileUploader } from '~/utils/hooks/fileUploader';
import { UPLOAD_SUBJECTS, UPLOAD_TARGETS } from '~/redux/uploads/constants';
import { FormikProvider } from 'formik';
import { INode } from '~/redux/types';
import { ModalWrapper } from '~/components/dialogs/ModalWrapper';

interface Props extends IDialogProps {
  node: INode;
}

const EditorDialog: FC<Props> = ({ node, onRequestClose }) => {
  const uploader = useFileUploader(UPLOAD_SUBJECTS.EDITOR, UPLOAD_TARGETS.NODES, []);
  const formik = useNodeFormFormik(node, uploader, onRequestClose);
  const { values, handleSubmit, dirty } = formik;

  const component = useMemo(() => node.type && prop(node.type, NODE_EDITORS), [node.type]);

  const onClose = useCallback(() => {
    if (!window.confirm('Точно выйти?')) {
      return;
    }

    onRequestClose();
  }, [onRequestClose, dirty]);

  if (!component) {
    return null;
  }

  return (
    <ModalWrapper onOverlayClick={onClose}>
      <FileUploaderProvider value={uploader}>
        <FormikProvider value={formik}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <BetterScrollDialog
              footer={<EditorButtons />}
              backdrop={<CoverBackdrop cover={values.cover} />}
              width={860}
              error=""
              onClose={onClose}
            >
              <div className={styles.editor}>{createElement(component)}</div>
            </BetterScrollDialog>
          </form>
        </FormikProvider>
      </FileUploaderProvider>
    </ModalWrapper>
  );
};

export { EditorDialog };
