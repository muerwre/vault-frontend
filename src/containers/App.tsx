import React, { VFC } from 'react';
import { ConnectedRouter } from 'connected-react-router';
import { history } from '~/redux/store';
import { MainLayout } from '~/containers/main/MainLayout';
import { Sprites } from '~/sprites/Sprites';
import { Modal } from '~/containers/dialogs/Modal';
import { PageCoverProvider } from '~/components/containers/PageCoverProvider';
import { BottomContainer } from '~/containers/main/BottomContainer';
import { MainRouter } from '~/containers/main/MainRouter';
import { DragDetectorProvider } from '~/hooks/dom/useDragDetector';
import { UserContextProvider } from '~/utils/context/UserContextProvider';
import { SWRConfigProvider } from '~/utils/providers/SWRConfigProvider';
import { observer } from 'mobx-react';
import { useGlobalLoader } from '~/hooks/dom/useGlobalLoader';

const App: VFC = observer(() => {
  useGlobalLoader();

  return (
    <ConnectedRouter history={history}>
      <SWRConfigProvider>
        <UserContextProvider>
          <DragDetectorProvider>
            <PageCoverProvider>
              <MainLayout>
                <Modal />
                <Sprites />

                <MainRouter />
              </MainLayout>
              <BottomContainer />
            </PageCoverProvider>
          </DragDetectorProvider>
        </UserContextProvider>
      </SWRConfigProvider>
    </ConnectedRouter>
  );
});

export { App };
