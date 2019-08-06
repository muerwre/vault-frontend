import React, { FC } from 'react';
import { ScrollDialog } from '../ScrollDialog';
import { IDialogProps } from '~/redux/modal/constants';
import { useCloseOnEscape } from '~/utils/hooks';
import { Group } from '~/components/containers/Group';
import { InputText } from '~/components/input/InputText';
import { Button } from '../../../components/input/Button/index';
import { Padder } from '~/components/containers/Padder';
import * as styles from '~/containers/examples/HorizontalExample/styles.scss';
import { connect } from 'react-redux';
import { selectNode } from '~/redux/node/selectors';

const mapStateToProps = selectNode;
const mapDispatchToProps = {};

type IProps = IDialogProps & {};

const EditorDialogUnconnected: FC<IProps> = ({ onRequestClose }) => {
  const title = <div>title</div>;

  const buttons = (
    <Padder>
      <Group horizontal>
        <InputText title="Название" />

        <Button title="Сохранить" iconRight="check" />
      </Group>
    </Padder>
  );

  useCloseOnEscape(onRequestClose);

  return (
    <ScrollDialog buttons={buttons} width={860}>
      <div className={styles.uploads}>
        <div className={styles.cell} />
        <div className={styles.cell} />
        <div className={styles.cell} />
        <div className={styles.cell} />
        <div className={styles.cell} />
        <div className={styles.cell} />
      </div>
    </ScrollDialog>
  );
};

const EditorDialog = connect(mapStateToProps, mapDispatchToProps)(EditorDialogUnconnected)

export { EditorDialog };
