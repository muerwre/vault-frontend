import React, { FC } from 'react';
import { connect } from 'react-redux';
import { hot } from 'react-hot-loader';
import { ConnectedRouter } from 'connected-react-router';
import { history } from '~/redux/store';
import { MainLayout } from '~/containers/main/MainLayout';
import { Sprites } from '~/sprites/Sprites';
import { Modal } from '~/containers/dialogs/Modal';
import { selectModal } from '~/redux/modal/selectors';
import { BlurWrapper } from '~/components/containers/BlurWrapper';
import { PageCover } from '~/components/containers/PageCover';
import { BottomContainer } from '~/containers/main/BottomContainer';
import { MainRouter } from '~/containers/main/MainRouter';

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

            <MainRouter />
          </MainLayout>
        </BlurWrapper>

        <BottomContainer />
      </div>
    </ConnectedRouter>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(hot(module)(Component));
