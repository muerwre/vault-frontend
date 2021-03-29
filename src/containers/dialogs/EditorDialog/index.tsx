import React, { createElement, FC, useMemo } from 'react';
import { IDialogProps } from '~/redux/modal/constants';
import { useCloseOnEscape } from '~/utils/hooks';
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
import { useShallowSelect } from '~/utils/hooks/useShallowSelect';
import { selectNodeEditor } from '~/redux/node/selectors';

interface Props extends IDialogProps {
  type: string;
}

const EditorDialog: FC<Props> = ({ type, onRequestClose }) => {
  const editor = useShallowSelect(selectNodeEditor);
  const uploader = useFileUploader(UPLOAD_SUBJECTS.EDITOR, UPLOAD_TARGETS.NODES, []);
  const formik = useNodeFormFormik({ ...editor, type }, uploader, onRequestClose);
  const { values, handleSubmit } = formik;

  useCloseOnEscape(onRequestClose);

  const component = useMemo(() => prop(type, NODE_EDITORS), [type]);

  if (!component) {
    return null;
  }

  return (
    <FileUploaderProvider value={uploader}>
      <FormikProvider value={formik}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <BetterScrollDialog
            footer={<EditorButtons />}
            backdrop={<CoverBackdrop cover={values.cover} />}
            width={860}
            error=""
            onClose={onRequestClose}
          >
            <div className={styles.editor}>{createElement(component)}</div>
          </BetterScrollDialog>
        </form>
      </FormikProvider>
    </FileUploaderProvider>
  );
};

export { EditorDialog };
