import * as React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { hot } from "react-hot-loader";
import { ConnectedRouter } from "connected-react-router";
import { history } from "~/redux/store";
import { NavLink, Switch, Route, Redirect } from "react-router-dom";
import { FlowLayout } from "~/containers/flow/FlowLayout";
import { LoginLayout } from "~/containers/login/LoginLayout";
import { MainLayout } from "~/containers/main/MainLayout";
import { ImageExample } from "~/containers/examples/ImageExample";
import { EditorExample } from "~/containers/examples/EditorExample";
import { HorizontalExample } from "~/containers/examples/HorizontalExample";
import { Sprites } from "~/sprites/Sprites";
import { URLS } from "~/constants/urls";

interface IAppProps {}
interface IAppState {}

class Component extends React.Component<IAppProps, IAppState> {
  render() {
    return (
      <ConnectedRouter history={history}>
        <MainLayout>
          <Sprites />

          <Switch>
            <Route path={URLS.EXAMPLES.IMAGE} component={ImageExample} />
            <Route path={URLS.EXAMPLES.EDITOR} component={EditorExample} />
            <Route path="/examples/horizontal" component={HorizontalExample} />
            <Route exact path={URLS.BASE} component={FlowLayout} />

            <Route path={URLS.AUTH.LOGIN} component={LoginLayout} />

            <Redirect to="/" />
          </Switch>
        </MainLayout>
      </ConnectedRouter>
    );
  }
}

const mapStateToProps = (state, props) => ({});
const mapDispatchToProps = dispatch => bindActionCreators({}, dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(hot(module)(Component));
