import React, { FC } from 'react';
import { useRouteMatch } from 'react-router';
import { SidebarWrapper } from '~/containers/sidebars/SidebarWrapper';
import { FormikProvider } from 'formik';
import { useNodeFormFormik } from '~/utils/hooks/useNodeFormFormik';
import { EMPTY_NODE } from '~/redux/node/constants';
import { FileUploaderProvider, useFileUploader } from '~/utils/hooks/fileUploader';
import { UPLOAD_SUBJECTS, UPLOAD_TARGETS } from '~/redux/uploads/constants';
import styles from './styles.module.scss';
import { NewEditorPanel } from '~/containers/editors/NewEditorPanel';
import { NewEditorContent } from '~/containers/editors/NewEditorContent';
import { BlockType, INode } from '~/redux/types';

type RouteParams = { type: string };

const data: INode = {
  ...EMPTY_NODE,
  blocks: [
    {
      type: BlockType.text,
      text: 'test',
    },
    {
      type: BlockType.text,
      text: 'test',
    },
    {
      type: BlockType.text,
      text: 'test',
    },
  ],
};

const NewEditorDialog: FC = ({}) => {
  const {
    params: { type },
  } = useRouteMatch<RouteParams>();

  const uploader = useFileUploader(UPLOAD_SUBJECTS.COMMENT, UPLOAD_TARGETS.COMMENTS, data?.files);

  const formik = useNodeFormFormik({ ...data, type }, uploader, console.log);

  return (
    <FileUploaderProvider value={uploader}>
      <FormikProvider value={formik}>
        <SidebarWrapper>
          <div className={styles.content}>
            <NewEditorContent />
          </div>

          <div className={styles.panel}>
            <NewEditorPanel />
          </div>
        </SidebarWrapper>
      </FormikProvider>
    </FileUploaderProvider>
  );
};

export { NewEditorDialog };
