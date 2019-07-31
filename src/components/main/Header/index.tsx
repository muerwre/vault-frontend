import * as React from 'react';
import { Logo } from "~/components/main/Logo";
import { connect } from 'react-redux';
import { IUserProfile, IUserState } from "~/redux/user/reducer";

import * as style from './style.scss';
import {Filler} from "~/components/containers/Filler";
import {Group} from "~/components/containers/Group";

interface IHeaderProps {
  username?: IUserProfile['username'],
  is_user?: IUserProfile['is_user'],
}

export const Component: React.FunctionComponent<IHeaderProps> = ({ username, is_user }) => (
  <div className="default_container head_container">
    <div className={style.container}>
      <Logo />

      <Filler />

      <div className={style.plugs}>
        <div>depth</div>
        <div>boris</div>
        <div>flow</div>
      </div>

      <Filler />

      <Group horizontal className={style.user_button}>
        <div>username</div>
        <div className={style.user_avatar} />
      </Group>
    </div>
  </div>
);

const mapStateToProps = ({ user: { profile: { username, is_user } } }: { user: IUserState }) => ({ username, is_user });

export const Header = connect(mapStateToProps)(Component);
