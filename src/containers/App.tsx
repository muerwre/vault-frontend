import React, { VFC } from 'react';
import { ConnectedRouter } from 'connected-react-router';
import { history } from '~/redux/store';
import { MainLayout } from '~/containers/main/MainLayout';
import { Sprites } from '~/sprites/Sprites';
import { Modal } from '~/containers/dialogs/Modal';
import { PageCover } from '~/components/containers/PageCover';
import { BottomContainer } from '~/containers/main/BottomContainer';
import { MainRouter } from '~/containers/main/MainRouter';
import { DragDetectorProvider } from '~/utils/hooks/useDragDetector';
import { useUser } from '~/utils/hooks/user/userUser';
import { UserProvider } from '~/utils/providers/UserProvider';

const App: VFC = () => {
  const user = useUser();

  return (
    <ConnectedRouter history={history}>
      <UserProvider user={user}>
        <DragDetectorProvider>
          <PageCover />

          <MainLayout>
            <Modal />
            <Sprites />

            <MainRouter />
          </MainLayout>
          <BottomContainer />
        </DragDetectorProvider>
      </UserProvider>
    </ConnectedRouter>
  );
};

export { App };
