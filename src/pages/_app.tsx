import { StoreContextProvider } from '~/utils/context/StoreContextProvider';
import { getMOBXStore } from '~/store';
import '~/styles/main.scss';
import { ToastProvider } from '~/utils/providers/ToastProvider';
import { Modal } from '~/containers/dialogs/Modal';
import { Sprites } from '~/sprites/Sprites';
import React from 'react';
import { BottomContainer } from '~/containers/main/BottomContainer';
import { SWRConfigProvider } from '~/utils/providers/SWRConfigProvider';
import { UserContextProvider } from '~/utils/context/UserContextProvider';
import { DragDetectorProvider } from '~/hooks/dom/useDragDetector';
import { PageCoverProvider } from '~/components/containers/PageCoverProvider';
import { SearchProvider } from '~/utils/providers/SearchProvider';
import { AudioPlayerProvider } from '~/utils/providers/AudioPlayerProvider';
import { MetadataProvider } from '~/utils/providers/MetadataProvider';
import { AuthProvider } from '~/utils/providers/AuthProvider';
import { MainLayout } from '~/containers/main/MainLayout';
import { useGlobalLoader } from '~/hooks/dom/useGlobalLoader';

const mobxStore = getMOBXStore();

export default function MyApp({ Component, pageProps }) {
  return (
    <StoreContextProvider store={mobxStore}>
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
                        <Component {...pageProps} />
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
    </StoreContextProvider>
  );
}
