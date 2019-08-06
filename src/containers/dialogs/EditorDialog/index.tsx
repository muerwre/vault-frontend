import React, { FC, useState, useCallback } from 'react';
import { ScrollDialog } from '../ScrollDialog';
import { IDialogProps } from '~/redux/modal/constants';
import { useCloseOnEscape } from '~/utils/hooks';
import { Group } from '~/components/containers/Group';
import { InputText } from '~/components/input/InputText';
import { Button } from '../../../components/input/Button/index';
import { Padder } from '~/components/containers/Padder';
import * as styles from './styles.scss';
import { connect } from 'react-redux';
import { selectNode } from '~/redux/node/selectors';
import { ImageEditor } from '~/components/editors/ImageEditor';

const mapStateToProps = selectNode;
const mapDispatchToProps = {};

type IProps = IDialogProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & {};

const EditorDialogUnconnected: FC<IProps> = ({ onRequestClose, editor }) => {
  const [data, setData] = useState(editor);
  const setTitle = useCallback(title => {
    setData({ ...data, title });
  }, [setData, data]);

  const buttons = (
    <Padder>
      <Group horizontal>
        <InputText title="Название" value={data.title} handler={setTitle} />

        <Button title="Сохранить" iconRight="check" />
      </Group>
    </Padder>
  );

  useCloseOnEscape(onRequestClose);

  return (
    <ScrollDialog buttons={buttons} width={860}>
      <div className={styles.editor}>
        <ImageEditor
          data={data}
          setData={setData}
        />
      </div>
    </ScrollDialog>
  );
};

const EditorDialog = connect(mapStateToProps, mapDispatchToProps)(EditorDialogUnconnected)

export { EditorDialog };
