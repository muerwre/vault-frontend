import * as React from 'react';
import { Logo } from "~/components/main/Logo";
import { connect } from 'react-redux';
import { IUserState } from "~/redux/user/reducer";
import { push as historyPush } from 'connected-react-router';

import * as style from './style.scss';
import {Filler} from "~/components/containers/Filler";
import {Group} from "~/components/containers/Group";
import { Link } from 'react-router-dom';

const mapStateToProps = ({ user: { profile: { username, is_user } } }: { user: IUserState }) => ({ username, is_user });
const mapDispatchToProps = {
  push: historyPush,
};

type IHeaderProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & {};

export const Component: React.FunctionComponent<IHeaderProps> = ({ username, is_user }) => {
  return (
    <div className="default_container head_container">
      <div className={style.container}>
        <Logo/>

        <Filler/>

        <div className={style.plugs}>
          <Link to="/">flow</Link>
          <Link to="/examples/image">image</Link>
          <Link to="/examples/edit">editor</Link>
          <Link to="/examples/horizontal">horizontal</Link>
        </div>

        <Filler/>

        <Group horizontal className={style.user_button}>
          <div>username</div>
          <div className={style.user_avatar}/>
        </Group>
      </div>
    </div>
  );
};

export const Header = connect(mapStateToProps, mapDispatchToProps)(Component);
