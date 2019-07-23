import * as React from 'react';
import { Logo } from "~/components/main/Logo";
import { connect } from 'react-redux';
import { IUserProfile, IUserState } from "~/redux/user/reducer";

const style = require('./style.scss');

interface IHeaderProps {
  username?: IUserProfile['username'],
  is_user?: IUserProfile['is_user'],
}

export const Component: React.FunctionComponent<IHeaderProps> = ({ username, is_user }) => (
  <div className="default_container head_container">
    <div className={style.container}>
      <Logo />
      <div className={style.spacer} />
      {
        is_user && username &&
        <div className={style.user_button}>
          <div className={style.user_avatar} />
          {username}
        </div>
      }
      <div className={style.plugs}>
        <div>depth</div>
        <div>boris</div>
        <div>flow</div>
      </div>

    </div>
  </div>
);

const mapStateToProps = ({ user: { profile: { username, is_user } } }: { user: IUserState }) => ({ username, is_user });

export const Header = connect(mapStateToProps)(Component);
