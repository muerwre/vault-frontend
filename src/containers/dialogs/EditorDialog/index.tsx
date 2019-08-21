import React, {
 FC, useState, useCallback, useEffect, FormEvent,
} from 'react';
import { connect } from 'react-redux';
import assocPath from 'ramda/es/assocPath';
import append from 'ramda/es/append';
import uuid from 'uuid4';
import { ScrollDialog } from '../ScrollDialog';
import { IDialogProps } from '~/redux/modal/constants';
import { useCloseOnEscape } from '~/utils/hooks';
import { Group } from '~/components/containers/Group';
import { InputText } from '~/components/input/InputText';
import { Button } from '~/components/input/Button';
import { Padder } from '~/components/containers/Padder';
import * as styles from './styles.scss';
import { selectNode } from '~/redux/node/selectors';
import { ImageEditor } from '~/components/editors/ImageEditor';
import { EditorPanel } from '~/components/editors/EditorPanel';
import { moveArrItem } from '~/utils/fn';
import { IFile, IFileWithUUID } from '~/redux/types';
import * as UPLOAD_ACTIONS from '~/redux/uploads/actions';
import { selectUploads } from '~/redux/uploads/selectors';
import { UPLOAD_TARGETS, UPLOAD_TYPES, UPLOAD_SUBJECTS } from '~/redux/uploads/constants';

const mapStateToProps = (state) => {
  const { editor } = selectNode(state);
  const { statuses, files } = selectUploads(state);

  return { editor, statuses, files };
};

const mapDispatchToProps = {
  uploadUploadFiles: UPLOAD_ACTIONS.uploadUploadFiles,
};

type IProps = IDialogProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & {};

const EditorDialogUnconnected: FC<IProps> = ({
  onRequestClose,
  editor,
  uploadUploadFiles,
  files,
  statuses,
}) => {
  const [data, setData] = useState(editor);
  const eventPreventer = useCallback(event => event.preventDefault(), []);
  const [temp, setTemp] = useState([]);

  const onFileMove = useCallback(
    (old_index: number, new_index: number) => {
      setData(assocPath(['files'], moveArrItem(old_index, new_index, data.files), data));
    },
    [data, setData]
  );

  const onFileAdd = useCallback(
    (file: IFile) => {
      setData(assocPath(['files'], append(file, data.files), data));
    },
    [data, setData]
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (!event.dataTransfer || !event.dataTransfer.files || !event.dataTransfer.files.length) return;

      const items: IFileWithUUID[] = Array.from(event.dataTransfer.files).map(
        (file: File): IFileWithUUID => ({
          file,
          temp_id: uuid(),
          subject: UPLOAD_SUBJECTS.EDITOR,
          target: UPLOAD_TARGETS.NODES,
          type: UPLOAD_TYPES.IMAGE,
        })
      );

      const temps = items.map(file => file.temp_id);

      setTemp([...temp, ...temps]);
      uploadUploadFiles(items);
    },
    [uploadUploadFiles, temp]
  );

  const onInputChange = useCallback(
    (event) => {
      event.preventDefault();

      if (!event.target.files || !event.target.files.length) return;

      const items: IFileWithUUID[] = Array.from(event.target.files).map(
        (file: File): IFileWithUUID => ({
          file,
          temp_id: uuid(),
          subject: UPLOAD_SUBJECTS.EDITOR,
          target: UPLOAD_TARGETS.NODES,
          type: UPLOAD_TYPES.IMAGE,
        })
      );

      const temps = items.map(file => file.temp_id);

      setTemp([...temp, ...temps]);
      uploadUploadFiles(items);
    },
    [uploadUploadFiles, temp]
  );

  useEffect(() => {
    window.addEventListener('dragover', eventPreventer, false);
    window.addEventListener('drop', eventPreventer, false);

    return () => {
      window.removeEventListener('dragover', eventPreventer, false);
      window.removeEventListener('drop', eventPreventer, false);
    };
  }, [eventPreventer]);

  // useEffect(() => console.log({ temp }), [temp]);
  // useEffect(() => console.log({ data }), [data]);

  useEffect(() => {
    Object.entries(statuses).forEach(([id, status]) => {
      if (temp.includes(id) && !!status.uuid && files[status.uuid]) {
        onFileAdd(files[status.uuid]);
        setTemp(temp.filter(el => el !== id));
      }
    });
  }, [statuses, files, temp, onFileAdd]);

  const setTitle = useCallback(
    (title) => {
      setData({ ...data, title });
    },
    [setData, data]
  );

  const onSubmit = useCallback((event: FormEvent) => {
    event.preventDefault();
    console.log({ data });
  }, [data]);

  const buttons = (
    <Padder style={{ position: 'relative' }}>
      <EditorPanel data={data} setData={setData} onUpload={onInputChange} />

      <Group horizontal>
        <InputText title="Название" value={data.title} handler={setTitle} autoFocus />

        <Button title="Сохранить" iconRight="check" />
      </Group>
    </Padder>
  );

  useCloseOnEscape(onRequestClose);

  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <ScrollDialog buttons={buttons} width={860} onClose={onRequestClose}>
        <div className={styles.editor} onDrop={onDrop}>
          <ImageEditor
            data={data}
            pending_files={temp.filter(id => !!statuses[id]).map(id => statuses[id])}
            setData={setData}
            onUpload={onInputChange}
            onFileMove={onFileMove}
            onInputChange={onInputChange}
          />
        </div>
      </ScrollDialog>
    </form>
  );
};

const EditorDialog = connect(
  mapStateToProps,
  mapDispatchToProps
)(EditorDialogUnconnected);

export { EditorDialog };
