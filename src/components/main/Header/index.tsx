import * as React from "react";
import { Logo } from "~/components/main/Logo";
import { connect } from "react-redux";
import { push as historyPush } from "connected-react-router";

import * as style from "./style.scss";
import { Filler } from "~/components/containers/Filler";
import { Link } from "react-router-dom";
import {selectUser} from "~/redux/auth/selectors";
import {Group} from "~/components/containers/Group";

const mapStateToProps = selectUser;

const mapDispatchToProps = {
  push: historyPush
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & {};

const HeaderUnconnected: React.FunctionComponent<IProps> = ({
  username,
  is_user
}) => {
  return (
    <div className="default_container head_container">
      <div className={style.container}>
        <Logo />

        <Filler />

        <div className={style.plugs}>
          <Link to="/">flow</Link>
          <Link to="/examples/image">image</Link>
          <Link to="/examples/edit">editor</Link>
          <Link to="/examples/horizontal">horizontal</Link>
        </div>

        <Filler />

        <Group horizontal className={style.user_button}>
          <div>username</div>
          <div className={style.user_avatar}/>
        </Group>
      </div>
    </div>
  );
};

const Header = connect(
  mapStateToProps,
  mapDispatchToProps
)(HeaderUnconnected);

export { Header };
