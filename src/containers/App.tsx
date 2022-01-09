import React, { VFC } from 'react';
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
import { SearchProvider } from '~/utils/providers/SearchProvider';
import { ToastProvider } from '~/utils/providers/ToastProvider';
import { AudioPlayerProvider } from '~/utils/providers/AudioPlayerProvider';
import { MetadataProvider } from '~/utils/providers/MetadataProvider';
import { AuthProvider } from '~/utils/providers/AuthProvider';
import { BrowserRouter } from 'react-router-dom';

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
