import React, {
  createElement,
  FC,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { connect } from 'react-redux';
import { IDialogProps } from '~/redux/modal/constants';
import { useCloseOnEscape } from '~/utils/hooks';
import { Group } from '~/components/containers/Group';
import { InputText } from '~/components/input/InputText';
import { Button } from '~/components/input/Button';
import { Padder } from '~/components/containers/Padder';
import styles from './styles.module.scss';
import { selectNode } from '~/redux/node/selectors';
import { EditorPanel } from '~/components/editors/EditorPanel';
import * as NODE_ACTIONS from '~/redux/node/actions';
import { selectUploads } from '~/redux/uploads/selectors';
import { ERROR_LITERAL } from '~/constants/errors';
import { EMPTY_NODE, NODE_EDITORS } from '~/redux/node/constants';
import { BetterScrollDialog } from '../BetterScrollDialog';
import { CoverBackdrop } from '~/components/containers/CoverBackdrop';
import { IEditorComponentProps } from '~/redux/node/types';
import { has, values } from 'ramda';

const mapStateToProps = state => {
  const { editor, errors } = selectNode(state);
  const { statuses, files } = selectUploads(state);

  return { editor, statuses, files, errors };
};

const mapDispatchToProps = {
  nodeSave: NODE_ACTIONS.nodeSave,
  nodeSetSaveErrors: NODE_ACTIONS.nodeSetSaveErrors,
};

type IProps = IDialogProps &
  ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps & {
    type: string;
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
  const [temp, setTemp] = useState<string[]>([]);

  useEffect(() => setData(editor), [editor]);

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
    if (!Object.prototype.hasOwnProperty.call(NODE_EDITORS, type) && onRequestClose)
      onRequestClose();
  }, [type]);

  useEffect(() => {
    if (!Object.keys(errors).length) return;
    nodeSetSaveErrors({});
  }, [data]);

  const buttons = (
    <Padder style={{ position: 'relative' }}>
      <EditorPanel data={data} setData={setData} temp={temp} setTemp={setTemp} />

      <Group horizontal>
        <InputText
          title="Название"
          value={data.title}
          handler={setTitle}
          autoFocus
          maxLength={256}
        />

        <Button title="Сохранить" iconRight="check" />
      </Group>
    </Padder>
  );

  useCloseOnEscape(onRequestClose);

  const error = values(errors)[0];
  const component = useMemo(() => {
    if (!has(type, NODE_EDITORS)) {
      return undefined;
    }

    return NODE_EDITORS[type];
  }, [type]);

  if (!component) {
    return null;
  }

  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <BetterScrollDialog
        footer={buttons}
        backdrop={<CoverBackdrop cover={data.cover} />}
        width={860}
        error={error && ERROR_LITERAL[error]}
        onClose={onRequestClose}
      >
        <div className={styles.editor}>
          {createElement(component, {
            data,
            setData,
            temp,
            setTemp,
          } as IEditorComponentProps)}
        </div>
      </BetterScrollDialog>
    </form>
  );
};

const EditorDialog = connect(mapStateToProps, mapDispatchToProps)(EditorDialogUnconnected);

export { EditorDialog };
