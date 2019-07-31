import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { hot } from 'react-hot-loader';
import { ConnectedRouter } from "connected-react-router";
import { history } from "~/redux/store";
import { NavLink, Switch, Route, Redirect } from 'react-router-dom';
import { FlowLayout } from "~/containers/flow/FlowLayout";
import { LoginLayout } from "~/containers/login/LoginLayout";
import { MainLayout } from "~/containers/main/MainLayout";
import { ImageExample } from "~/containers/examples/ImageExample";
import { EditorExample } from "~/containers/examples/EditorExample";
import { HorizontalExample } from "~/containers/examples/HorizontalExample";
import { Sprites } from "~/sprites/Sprites";
import {GodRays} from "~/components/main/GodRays";

interface IAppProps {}
interface IAppState {}

class Component extends React.Component<IAppProps, IAppState> {
  render() {
    return (
      <ConnectedRouter history={history}>
        <MainLayout>
          <GodRays />

          <Sprites />

          <Switch>
            <Route path="/examples/image" component={ImageExample} />
            <Route path="/examples/edit" component={EditorExample} />
            <Route path="/examples/horizontal" component={HorizontalExample} />
            <Route path="/" component={FlowLayout} />

            <Route path="/login" component={LoginLayout} />

            <Redirect to="/" />
          </Switch>
        </MainLayout>
      </ConnectedRouter>
    );
  }
}

const mapStateToProps = (state, props) => ({ });
const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(hot(module)(Component));
