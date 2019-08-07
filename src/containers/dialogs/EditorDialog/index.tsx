import React, { FC, useState, useCallback } from 'react';
import { ScrollDialog } from '../ScrollDialog';
import { IDialogProps } from '~/redux/modal/constants';
import { useCloseOnEscape } from '~/utils/hooks';
import { Group } from '~/components/containers/Group';
import { InputText } from '~/components/input/InputText';
import { Button } from '~/components/input/Button';
import { Padder } from '~/components/containers/Padder';
import * as styles from './styles.scss';
import { connect } from 'react-redux';
import { selectNode } from '~/redux/node/selectors';
import { ImageEditor } from '~/components/editors/ImageEditor';
import { EditorPanel } from '~/components/editors/EditorPanel';
import * as UPLOAD_ACTIONS from '~/redux/uploads/actions';
import { IFileWithUUID } from '~/redux/types';

const mapStateToProps = selectNode;
const mapDispatchToProps = {
  uploadUploadFiles: UPLOAD_ACTIONS.uploadUploadFiles,
};

type IProps = IDialogProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & {};

const EditorDialogUnconnected: FC<IProps> = ({ onRequestClose, editor, uploadUploadFiles }) => {
  const [data, setData] = useState(editor);

  const setTitle = useCallback(
    title => {
      setData({ ...data, title });
    },
    [setData, data]
  );

  const onUpload = useCallback(
    (files: IFileWithUUID[]) => {
      uploadUploadFiles(files);
    },
    [uploadUploadFiles]
  );

  const buttons = (
    <Padder style={{ position: 'relative' }}>
      <EditorPanel data={data} setData={setData} onUpload={onUpload} />

      <Group horizontal>
        <InputText title="Название" value={data.title} handler={setTitle} />

        <Button title="Сохранить" iconRight="check" />
      </Group>
    </Padder>
  );

  useCloseOnEscape(onRequestClose);

  return (
    <ScrollDialog buttons={buttons} width={860} onClose={onRequestClose}>
      <div className={styles.editor}>
        <ImageEditor data={data} setData={setData} onUpload={onUpload} />
      </div>
    </ScrollDialog>
  );
};

const EditorDialog = connect(
  mapStateToProps,
  mapDispatchToProps
)(EditorDialogUnconnected);

export { EditorDialog };
