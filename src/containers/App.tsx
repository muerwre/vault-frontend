import * as React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { hot } from "react-hot-loader";
import { ConnectedRouter } from "connected-react-router";
import { history } from "~/redux/store";
import { NavLink, Switch, Route, Redirect } from "react-router-dom";
import { FlowLayout } from "~/containers/flow/FlowLayout";
import { MainLayout } from "~/containers/main/MainLayout";
import { ImageExample } from "~/containers/examples/ImageExample";
import { EditorExample } from "~/containers/examples/EditorExample";
import { HorizontalExample } from "~/containers/examples/HorizontalExample";
import { Sprites } from "~/sprites/Sprites";
import { URLS } from "~/constants/urls";
import { Modal } from "~/containers/dialogs/Modal";
import { selectModal } from "~/redux/modal/selectors";
import { BlurWrapper } from "~/components/containers/BlurWrapper";

const mapStateToProps = selectModal;
const mapDispatchToProps = {};

type IProps = typeof mapDispatchToProps & ReturnType<typeof mapStateToProps> & {};

class Component extends React.Component<IProps, {}> {
  render() {
    return (
      <ConnectedRouter history={history}>
        <BlurWrapper is_blurred={this.props.is_shown}>
          <MainLayout>
            <Modal />
            <Sprites />

            <Switch>
              <Route path={URLS.EXAMPLES.IMAGE} component={ImageExample} />
              <Route path={URLS.EXAMPLES.EDITOR} component={EditorExample} />
              <Route path="/examples/horizontal" component={HorizontalExample} />
              <Route exact path={URLS.BASE} component={FlowLayout} />

              <Redirect to="/" />
            </Switch>
          </MainLayout>
        </BlurWrapper>
      </ConnectedRouter>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(hot(module)(Component));
