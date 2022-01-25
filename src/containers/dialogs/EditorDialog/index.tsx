import React, { createElement, FC, useCallback, useMemo, useState } from 'react';

import { FormikProvider } from 'formik';
import { observer } from 'mobx-react-lite';

import { CoverBackdrop } from '~/components/containers/CoverBackdrop';
import { BetterScrollDialog } from '~/components/dialogs/BetterScrollDialog';
import { EditorButtons } from '~/components/editors/EditorButtons';
import { EditorConfirmClose } from '~/components/editors/EditorConfirmClose';
import { NODE_EDITORS } from '~/constants/node';
import { UploadSubject, UploadTarget } from '~/constants/uploads';
import { useCloseOnEscape } from '~/hooks';
import { useUploader } from '~/hooks/data/useUploader';
import { useNodeFormFormik } from '~/hooks/node/useNodeFormFormik';
import { INode } from '~/types';
import { DialogComponentProps } from '~/types/modal';
import { UploaderContextProvider } from '~/utils/context/UploaderContextProvider';
import { prop } from '~/utils/ramda';

import styles from './styles.module.scss';

interface Props extends DialogComponentProps {
  node: INode;
  onSubmit: (node: INode) => Promise<unknown>;
}

const EditorDialog: FC<Props> = observer(({ node, onRequestClose, onSubmit }) => {
  const [isConfirmModalShown, setConfirmModalShown] = useState(false);

  const uploader = useUploader(UploadSubject.Editor, UploadTarget.Nodes, node.files);
  const formik = useNodeFormFormik(node, uploader, onRequestClose, onSubmit);
  const { values, handleSubmit, dirty } = formik;

  const component = useMemo(() => node.type && prop(node.type, NODE_EDITORS), [node.type]);

  const closeConfirmModal = useCallback(() => {
    setConfirmModalShown(false);
  }, [setConfirmModalShown]);

  const onClose = useCallback(() => {
    if (!dirty) {
      onRequestClose();
      return;
    }

    if (isConfirmModalShown) {
      closeConfirmModal();
      return;
    }

    setConfirmModalShown(true);
  }, [dirty, isConfirmModalShown, onRequestClose, closeConfirmModal]);

  useCloseOnEscape(onClose);

  if (!component) {
    return null;
  }

  return (
    <UploaderContextProvider value={uploader}>
      <FormikProvider value={formik}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <BetterScrollDialog
            footer={<EditorButtons />}
            backdrop={<CoverBackdrop cover={values.cover} />}
            width={860}
            onClose={onClose}
          >
            <>
              {isConfirmModalShown && (
                <EditorConfirmClose onApprove={onRequestClose} onDecline={closeConfirmModal} />
              )}

              <div className={styles.editor}>{createElement(component)}</div>
            </>
          </BetterScrollDialog>
        </form>
      </FormikProvider>
    </UploaderContextProvider>
  );
});

export { EditorDialog };
