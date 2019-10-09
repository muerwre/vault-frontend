import React, { FC, useCallback } from 'react';
import { connect } from 'react-redux';
import { push as historyPush } from 'connected-react-router';
import { Link } from 'react-router-dom';
import { Logo } from '~/components/main/Logo';

import * as style from './style.scss';
import { Filler } from '~/components/containers/Filler';
import { selectUser } from '~/redux/auth/selectors';
import { Group } from '~/components/containers/Group';
import * as MODAL_ACTIONS from '~/redux/modal/actions';
import { DIALOGS } from '~/redux/modal/constants';

const mapStateToProps = selectUser;

const mapDispatchToProps = {
  push: historyPush,
  showDialog: MODAL_ACTIONS.modalShowDialog,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & {};

const HeaderUnconnected: FC<IProps> = ({ username, is_user, showDialog }) => {
  const onLogin = useCallback(() => showDialog(DIALOGS.LOGIN), [showDialog]);
  const onOpenEditor = useCallback(() => showDialog(DIALOGS.EDITOR), [showDialog]);

  return (
    <div className={style.container}>
      <Logo />

      <Filler />

      <div className={style.plugs}>
        <Link to="/">flow</Link>
        <Link to="/examples/image">image</Link>
        <div onClick={onOpenEditor}>editor</div>
      </div>

      {is_user && (
        <Group horizontal className={style.user_button}>
          <div className={style.user_avatar} />
        </Group>
      )}

      {!is_user && (
        <Group horizontal className={style.user_button} onClick={onLogin}>
          <div>ВДОХ</div>
        </Group>
      )}
    </div>
  );
};

const Header = connect(
  mapStateToProps,
  mapDispatchToProps
)(HeaderUnconnected);

export { Header };
