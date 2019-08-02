import React, { FC, useState } from 'react';
import { ScrollDialog } from '../ScrollDialog';
import { IDialogProps } from '~/redux/modal/constants';
import { useCloseOnEscape } from '~/utils/hooks';
import { Group } from '~/components/containers/Group';
import { InputText } from '~/components/input/InputText';
import { Button } from '~/components/input/Button';
import { Padder } from '~/components/containers/Padder';
import * as styles from './styles.scss';
type IProps = IDialogProps & {};

const LoginDialog: FC<IProps> = ({ onRequestClose }) => {
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');

  const buttons = (
    <Padder>
      <Group horizontal>
        <Button title="ВОЙТИ" stretchy />
      </Group>
    </Padder>
  );

  useCloseOnEscape(onRequestClose);

  return (
    <ScrollDialog buttons={buttons} width={260}>
      <Padder>
        <div className={styles.wrap}>
          <Group>
            <h2>РЕШИТЕЛЬНО ВОЙТИ</h2>

            <div />
            <div />

            <InputText title="Логин" handler={setUserName} value={username} />
            <InputText title="Пароль" handler={setPassword} value={password} />
          </Group>
        </div>
      </Padder>
    </ScrollDialog>
  );
};

export { LoginDialog };
