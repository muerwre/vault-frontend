import React, { FC, useState } from 'react';
import { connect } from 'react-redux';
import { IDialogProps } from '~/redux/modal/constants';
import { BetterScrollDialog } from '~/containers/dialogs/BetterScrollDialog';
import { Padder } from '~/components/containers/Padder';
import { DialogTitle } from '~/components/dialogs/DialogTitle';
import { Group } from '~/components/containers/Group';
import { InputText } from '~/components/input/InputText';
import styles from './styles.scss';

const mapStateToProps = () => ({});
const mapDispatchToProps = {};

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & IDialogProps & {};

const LoginSocialRegisterDialogUnconnected: FC<Props> = ({ onRequestClose }) => {
  const [username, setUsername] = useState('');

  return (
    <BetterScrollDialog onClose={onRequestClose} width={300}>
      <Padder>
        <div className={styles.wrap}>
          <Group>
            <DialogTitle>Добро пожаловать в семью!</DialogTitle>
            <InputText handler={setUsername} value={username} title="Юзернэйм" />
            <InputText handler={setUsername} value={username} title="Пароль" type="password" />
          </Group>
        </div>
      </Padder>
    </BetterScrollDialog>
  );
};

const LoginSocialRegisterDialog = connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginSocialRegisterDialogUnconnected);

export { LoginSocialRegisterDialog };
