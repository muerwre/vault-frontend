import React, { VFC } from 'react';

import { observer } from 'mobx-react-lite';
import { BrowserRouter } from 'react-router-dom';

import { PageCoverProvider } from '~/components/containers/PageCoverProvider';
import { Modal } from '~/containers/dialogs/Modal';
import { BottomContainer } from '~/containers/main/BottomContainer';
import { MainLayout } from '~/containers/main/MainLayout';
import { MainRouter } from '~/containers/main/MainRouter';
import { DragDetectorProvider } from '~/hooks/dom/useDragDetector';
import { useGlobalLoader } from '~/hooks/dom/useGlobalLoader';
import { Sprites } from '~/sprites/Sprites';
import { UserContextProvider } from '~/utils/context/UserContextProvider';
import { AudioPlayerProvider } from '~/utils/providers/AudioPlayerProvider';
import { AuthProvider } from '~/utils/providers/AuthProvider';
import { MetadataProvider } from '~/utils/providers/MetadataProvider';
import { SWRConfigProvider } from '~/utils/providers/SWRConfigProvider';
import { SearchProvider } from '~/utils/providers/SearchProvider';
import { ToastProvider } from '~/utils/providers/ToastProvider';

const App: VFC = observer(() => {
  useGlobalLoader();

  return (
    <BrowserRouter>
      <SWRConfigProvider>
        <UserContextProvider>
          <DragDetectorProvider>
            <PageCoverProvider>
              <SearchProvider>
                <AudioPlayerProvider>
                  <MetadataProvider>
                    <AuthProvider>
                      <MainLayout>
                        <ToastProvider />
                        <Modal />
                        <Sprites />

                        <MainRouter />
                      </MainLayout>
                      <BottomContainer />
                    </AuthProvider>
                  </MetadataProvider>
                </AudioPlayerProvider>
              </SearchProvider>
            </PageCoverProvider>
          </DragDetectorProvider>
        </UserContextProvider>
      </SWRConfigProvider>
    </BrowserRouter>
  );
});

export { App };
