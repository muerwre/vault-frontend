import React, { FC, useState, useCallback, FormEvent, useEffect, createElement } from 'react';
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
import { EditorPanel } from '~/components/editors/EditorPanel';
import * as NODE_ACTIONS from '~/redux/node/actions';
import { selectUploads } from '~/redux/uploads/selectors';
import { ERROR_LITERAL } from '~/constants/errors';
import { NODE_EDITORS, EMPTY_NODE } from '~/redux/node/constants';

const mapStateToProps = state => {
  const { editor, errors } = selectNode(state);
  const { statuses, files } = selectUploads(state);

  console.log('mss', { editor });

  return { editor, statuses, files, errors };
};

const mapDispatchToProps = {
  nodeSave: NODE_ACTIONS.nodeSave,
  nodeSetSaveErrors: NODE_ACTIONS.nodeSetSaveErrors,
};

type IProps = IDialogProps &
  ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps & {
    type: typeof NODE_EDITORS[keyof typeof NODE_EDITORS];
  };

const EditorDialogUnconnected: FC<IProps> = ({
  editor,
  errors,
  nodeSave,
  nodeSetSaveErrors,
  onRequestClose,
  type,
}) => {
  const [data, setData] = useState(EMPTY_NODE);
  const [temp, setTemp] = useState([]);

  useEffect(() => setData(editor), [editor]);

  const setTitle = useCallback(
    title => {
      setData({ ...data, title });
    },
    [setData, data]
  );

  const onSubmit = useCallback(
    (event: FormEvent) => {
      console.log({ data, editor });
      event.preventDefault();
      return;
      nodeSave(data);
    },
    [data, nodeSave, editor]
  );

  useEffect(() => {
    if (!NODE_EDITORS[type] && onRequestClose) onRequestClose();
  }, [type]);

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

  if (!NODE_EDITORS[type]) return null;

  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <ScrollDialog
        buttons={buttons}
        width={860}
        error={error && ERROR_LITERAL[error]}
        onClose={onRequestClose}
      >
        <div className={styles.editor}>
          {createElement(NODE_EDITORS[type], {
            data,
            setData,
            temp,
            setTemp,
          })}
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
