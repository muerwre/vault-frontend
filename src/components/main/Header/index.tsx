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
import { pick } from 'ramda';
import { Icon } from '~/components/input/Icon';
import { url } from 'inspector';
import { getURL } from '~/utils/dom';
import path from 'ramda/es/path';

const mapStateToProps = state => ({
  user: pick(['username', 'is_user', 'photo'])(selectUser(state)),
});

const mapDispatchToProps = {
  push: historyPush,
  showDialog: MODAL_ACTIONS.modalShowDialog,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & {};

const HeaderUnconnected: FC<IProps> = ({ user: { username, is_user, photo }, showDialog }) => {
  const onLogin = useCallback(() => showDialog(DIALOGS.LOGIN), [showDialog]);
  const onOpenEditor = useCallback(() => showDialog(DIALOGS.EDITOR), [showDialog]);

  return (
    <div className={style.container}>
      <Logo />

      <Filler />

      <div className={style.plugs}>
        <div onClick={onOpenEditor}>editor</div>
        <Link to="/">flow</Link>
      </div>

      {is_user && (
        <Group horizontal className={style.user_button}>
          <div>{username}</div>
          <div className={style.user_avatar} style={{ backgroundImage: `url('${getURL(photo)}')` }}>
            {(!photo || !photo.id) && <Icon icon="profile" />}
          </div>
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
