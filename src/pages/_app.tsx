import React from 'react';

import App from 'next/app';
import Head from 'next/head';

import { PageCoverProvider } from '~/components/containers/PageCoverProvider';
import { Modal } from '~/containers/dialogs/Modal';
import { BottomContainer } from '~/containers/main/BottomContainer';
import { DragDetectorProvider } from '~/hooks/dom/useDragDetector';
import { MainLayout } from '~/layouts/MainLayout';
import { Sprites } from '~/sprites/Sprites';
import { getMOBXStore } from '~/store';
import { CONFIG } from '~/utils/config';
import { StoreContextProvider } from '~/utils/context/StoreContextProvider';
import { UserContextProvider } from '~/utils/context/UserContextProvider';
import { AudioPlayerProvider } from '~/utils/providers/AudioPlayerProvider';
import { AuthProvider } from '~/utils/providers/AuthProvider';
import { MetadataProvider } from '~/utils/providers/MetadataProvider';
import { SWRConfigProvider } from '~/utils/providers/SWRConfigProvider';
import { SearchProvider } from '~/utils/providers/SearchProvider';
import { ToastProvider } from '~/utils/providers/ToastProvider';

import '~/styles/main.scss';

const mobxStore = getMOBXStore();

export default class MyApp extends App {
  render() {
    const { Component, pageProps, router } = this.props;
    const canonicalURL =
      !!CONFIG.publicHost && new URL(router.asPath, CONFIG.publicHost).toString();

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
                        <Head>
                          <meta
                            name="viewport"
                            content="width=device-width, initial-scale=1.0, minimum-scale=1.0, user-scalable=0"
                          />

                          {!!canonicalURL && <link rel="canonical" href={canonicalURL} />}
                        </Head>

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
}
