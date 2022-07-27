import { Context, createContext, createElement, FunctionComponent, PropsWithChildren, useCallback, useContext, useMemo } from 'react';

import { useRouter } from 'next/router';
import { has } from 'ramda';

import { ModalWrapper } from '~/components/dialogs/ModalWrapper';
import { sidebarComponents, SidebarName } from '~/constants/sidebar';
import { DialogComponentProps } from '~/types/modal';

type ContextValue = typeof SidebarContext extends Context<infer U> ? U : never;
type Name = keyof typeof sidebarComponents;

// TODO: use it to store props for sidebar
type Props<T extends Name> = typeof sidebarComponents[T] extends FunctionComponent<infer U> 
  ? U extends DialogComponentProps ? Omit<U, 'onRequestClose'> : U
  : {};

const SidebarContext = createContext({
  current: undefined as SidebarName | undefined,
  open: <T extends Name>(name: T) => {},
  close: () => {}, 
});

export const SidebarProvider = <T extends Name>({ children }: PropsWithChildren<{}>) => {
  const router = useRouter();
  const current = useMemo(() => {
    const val = router.query.sidebar as SidebarName | undefined

    return val && has(val, sidebarComponents) ? val : undefined;
  }, [router]);

  const open = useCallback(
    <T extends Name>(name: T) => {
      const [path] = router.asPath.split('?');
      void router.push(path + '?sidebar=' + name, path + '?sidebar=' + name, {
        shallow: true,
        scroll: false,
      });
    },
    [router]
  );

  const close = useCallback(
    () => {
      const [path] = router.asPath.split('?');

      console.log('trying to close');

      void router.replace(path, path, {
        shallow: true,
        scroll: false,
      });
    },
    [router]
  );
  
  const value = useMemo<ContextValue>(() => ({ 
    current,
    open,
    close,
  }), [current, open, close]);

  return (
    <SidebarContext.Provider value={value}>
      {children}
      {current && 
        <ModalWrapper onOverlayClick={close}>
          {createElement(
            sidebarComponents[current], 
            { onRequestClose: close } as any
          )}
        </ModalWrapper>
      }
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => useContext(SidebarContext);
