import React, { createElement, FC, useCallback, useEffect, useMemo } from 'react';
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
import { useTranslatedError } from '~/utils/hooks/useTranslatedError';
import { useCloseOnEscape } from '~/utils/hooks';

interface Props extends IDialogProps {
  node: INode;
}

const EditorDialog: FC<Props> = ({ node, onRequestClose }) => {
  const uploader = useFileUploader(UPLOAD_SUBJECTS.EDITOR, UPLOAD_TARGETS.NODES, node.files);
  const formik = useNodeFormFormik(node, uploader, onRequestClose);
  const { values, handleSubmit, dirty, status, setStatus } = formik;

  const component = useMemo(() => node.type && prop(node.type, NODE_EDITORS), [node.type]);

  const onClose = useCallback(() => {
    if (dirty && !window.confirm('Точно выйти?')) {
      return undefined;
    }

    onRequestClose();
  }, [onRequestClose, dirty]);

  const error = useTranslatedError(status);

  useEffect(() => {
    if (!status) {
      return;
    }

    setStatus('');
  }, [values]);

  useCloseOnEscape(onClose);

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
              error={error}
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
