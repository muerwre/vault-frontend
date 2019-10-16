import React, { FC, useState, useCallback, FormEvent, useEffect } from 'react';
import { connect } from 'react-redux';
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
import { ERROR_LITERAL } from '~/constants/errors';

const mapStateToProps = state => {
  const { editor, errors } = selectNode(state);
  const { statuses, files } = selectUploads(state);

  return { editor, statuses, files, errors };
};

const mapDispatchToProps = {
  nodeSave: NODE_ACTIONS.nodeSave,
  nodeSetSaveErrors: NODE_ACTIONS.nodeSetSaveErrors,
};

type IProps = IDialogProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & {};

const EditorDialogUnconnected: FC<IProps> = ({
  onRequestClose,
  editor,
  errors,
  nodeSave,
  nodeSetSaveErrors,
}) => {
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

  useEffect(() => {
    if (!Object.keys(errors).length) return;
    nodeSetSaveErrors({});
  }, [data]);

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

  const error = errors && Object.values(errors)[0];

  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <ScrollDialog
        buttons={buttons}
        width={860}
        error={error && ERROR_LITERAL[error]}
        onClose={onRequestClose}
      >
        <div className={styles.editor}>
          <ImageEditor data={data} setData={setData} temp={temp} setTemp={setTemp} />
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
