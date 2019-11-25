import React, { FC, useState, useMemo, useCallback } from 'react';
import { IDialogProps } from '~/redux/types';
import { connect } from 'react-redux';
import { BetterScrollDialog } from '../BetterScrollDialog';
import { Group } from '~/components/containers/Group';
import { InputText } from '~/components/input/InputText';
import { Button } from '~/components/input/Button';

const mapStateToProps = () => ({});
const mapDispatchToProps = {};

type IProps = IDialogProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & {};

const RestoreRequestDialogUnconnected: FC<IProps> = ({}) => {
  const [field, setField] = useState();

  const onSubmit = useCallback(event => {
    event.preventDefault();
  }, []);

  const buttons = useMemo(() => <Button>Восстановить</Button>, []);

  return (
    <form onSubmit={onSubmit}>
      <BetterScrollDialog footer={buttons}>
        <Group>
          <InputText title="Имя или email" value={field} handler={setField} />

          <div>Введите имя пользователя или адрес почты. Мы пришлем ссылку для сброса пароля.</div>
        </Group>
      </BetterScrollDialog>
    </form>
  );
};

const RestoreRequestDialog = connect(
  mapStateToProps,
  mapDispatchToProps
)(RestoreRequestDialogUnconnected);

export { RestoreRequestDialog };
