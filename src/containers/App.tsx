import React, { FC, useEffect } from 'react';
import { connect } from 'react-redux';
import { hot } from 'react-hot-loader';
import { ConnectedRouter } from 'connected-react-router';
import { Switch, Route, Redirect } from 'react-router-dom';
import { history } from '~/redux/store';
import { FlowLayout } from '~/containers/flow/FlowLayout';
import { MainLayout } from '~/containers/main/MainLayout';
import { ImageExample } from '~/containers/examples/ImageExample';
import { EditorExample } from '~/containers/examples/EditorExample';
import { HorizontalExample } from '~/containers/examples/HorizontalExample';
import { Sprites } from '~/sprites/Sprites';
import { URLS } from '~/constants/urls';
import { Modal } from '~/containers/dialogs/Modal';
import { selectModal } from '~/redux/modal/selectors';
import { BlurWrapper } from '~/components/containers/BlurWrapper';
import { PageCover } from '~/components/containers/PageCover';
import { NodeLayout } from './node/NodeLayout';
import { BottomContainer } from '~/containers/main/BottomContainer';
import { BorisLayout } from './node/BorisLayout';
import { ErrorNotFound } from './pages/ErrorNotFound';

const mapStateToProps = state => ({
  modal: selectModal(state),
});
const mapDispatchToProps = {};

type IProps = typeof mapDispatchToProps & ReturnType<typeof mapStateToProps> & {};

const Component: FC<IProps> = ({ modal: { is_shown } }) => {
  return (
    <ConnectedRouter history={history}>
      <div>
        <BlurWrapper is_blurred={is_shown}>
          <PageCover />
          <MainLayout>
            <Modal />
            <Sprites />

            <Switch>
              <Route exact path={URLS.BASE} component={FlowLayout} />
              <Route path={URLS.EXAMPLES.IMAGE} component={ImageExample} />
              <Route path={URLS.EXAMPLES.EDITOR} component={EditorExample} />
              <Route path={URLS.NODE_URL(':id')} component={NodeLayout} />
              <Route path={URLS.BORIS} component={BorisLayout} />
              <Route path={URLS.ERRORS.NOT_FOUND} component={ErrorNotFound} />

              <Redirect to="/" />
            </Switch>
          </MainLayout>
        </BlurWrapper>

        <BottomContainer />
      </div>
    </ConnectedRouter>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(hot(module)(Component));
