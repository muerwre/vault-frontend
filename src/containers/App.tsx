import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { hot } from 'react-hot-loader';
import { SomeComponent } from '$components/SomeComponent';
import { ConnectedRouter } from "connected-react-router";
import { history } from "$redux/store";
import { NavLink, Switch, Route } from 'react-router-dom';

interface IAppProps {}
interface IAppState {}

class Component extends React.Component<IAppProps, IAppState> {
  state = { };

  render() {
    return (
      <ConnectedRouter history={history}>
        <div>
          <div>
            <NavLink exact to="/" activeClassName="active">
              Root
            </NavLink>
            <NavLink to="/somepath" activeClassName="active">
              Something
            </NavLink>
          </div>
          <Switch>
            <Route
              exact
              path="/"
              component={SomeComponent}
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
