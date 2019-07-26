import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { hot } from 'react-hot-loader';
import { ConnectedRouter } from "connected-react-router";
import { history } from "~/redux/store";
import { NavLink, Switch, Route } from 'react-router-dom';
import { FlowLayout } from "~/containers/flow/FlowLayout";
import { LoginLayout } from "~/containers/login/LoginLayout";
import { MainLayout } from "~/containers/main/MainLayout";
import { ImageExample } from "~/containers/examples/ImageExample";

interface IAppProps {}
interface IAppState {}

class Component extends React.Component<IAppProps, IAppState> {
  render() {
    return (
      <ConnectedRouter history={history}>
        <MainLayout>
          <Switch>
            <Route path="/examples/image" component={ImageExample} />
            <Route path="/" component={FlowLayout} />

            <Route
              path="/login"
              component={LoginLayout}
            />
          </Switch>
        </MainLayout>
      </ConnectedRouter>
    );
  }
}

const mapStateToProps = (state, props) => ({ });
const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(hot(module)(Component));
