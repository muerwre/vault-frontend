import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { hot } from 'react-hot-loader';
import { SomeComponent } from '$components/SomeComponent';
import { ConnectedRouter } from "connected-react-router";
import { history } from "$redux/store";
import { NavLink, Switch, Route } from 'react-router-dom';
import { MainLayout } from "$containers/MainLayout";
import { FlowLayout } from "$containers/FlowLayout";

interface IAppProps {}
interface IAppState {}

class Component extends React.Component<IAppProps, IAppState> {
  render() {
    return (
      <ConnectedRouter history={history}>
        <div>
          <Switch>
            <Route
              exact
              path="/"
              component={FlowLayout}
            />
            <Route
              path="/somepath"
              component={SomeComponent}
            />
          </Switch>
        </div>
      </ConnectedRouter>
    );
  }
}

const mapStateToProps = (state, props) => ({ });
const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(hot(module)(Component));
