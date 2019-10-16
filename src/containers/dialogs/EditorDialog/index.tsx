import React, { FC, useState, useCallback, useEffect, FormEvent } from 'react';
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
import * as NODE_ACTIONS from '~/redux/node/actions';
import { selectUploads } from '~/redux/uploads/selectors';

const mapStateToProps = state => {
  const { editor } = selectNode(state);
  const { statuses, files } = selectUploads(state);

  return { editor, statuses, files };
};

const mapDispatchToProps = {
  nodeSave: NODE_ACTIONS.nodeSave,
};

type IProps = IDialogProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & {};

const EditorDialogUnconnected: FC<IProps> = ({ onRequestClose, editor, statuses, nodeSave }) => {
  const [data, setData] = useState(editor);
  const [temp, setTemp] = useState([]);

  const setTitle = useCallback(
    title => {
      setData({ ...data, title });
    },
    [setData, data]
  );

  const onSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      nodeSave(data);
    },
    [data, nodeSave]
  );

  const buttons = (
    <Padder style={{ position: 'relative' }}>
      <EditorPanel data={data} setData={setData} temp={temp} setTemp={setTemp} />

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
        <div className={styles.editor}>
          <ImageEditor
            data={data}
            pending_files={temp.filter(id => !!statuses[id]).map(id => statuses[id])}
            setData={setData}
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
