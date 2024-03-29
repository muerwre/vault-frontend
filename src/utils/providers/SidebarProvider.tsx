import {
  Context,
  createContext,
  createElement,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
} from 'react';

import { useRouter } from 'next/router';

import { ModalWrapper } from '~/components/common/ModalWrapper';
import { SidebarName } from '~/constants/sidebar';
import { sidebarComponents } from '~/constants/sidebar/components';
import { SidebarComponent, SidebarProps } from '~/types/sidebar';
import { has, omit } from '~/utils/ramda';

type ContextValue = typeof SidebarContext extends Context<infer U> ? U : never;

const SidebarContext = createContext({
  current: undefined as SidebarName | undefined,
  open: <T extends SidebarComponent>(name: T, props: SidebarProps<T>) => {},
  close: () => {},
});

export const SidebarProvider = <T extends SidebarComponent>({
  children,
}: PropsWithChildren<{}>) => {
  const router = useRouter();
  const current = useMemo(() => {
    const val = router.query.sidebar as SidebarName | undefined;

    return val && has(val, sidebarComponents) ? val : undefined;
  }, [router]);

  const open = useCallback(
    <T extends SidebarComponent>(name: T, props: SidebarProps<T>) => {
      const [path] = router.asPath.split('?');
      const query = Object.entries(props as {})
        .filter(([, val]) => val)
        .map(([name, val]) => `${name}=${val}`)
        .join('&');
      const url = path + '?sidebar=' + name + (query && `&${query}`);

      // don't store history inside the same sidebar
      if (router.query?.sidebar === name) {
        void router.replace(url, url, {
          shallow: true,
          scroll: false,
        });

        return;
      }

      void router.push(url, url, {
        shallow: true,
        scroll: false,
      });
    },
    [router],
  );

  const close = useCallback(() => {
    const [path] = router.asPath.split('?');

    void router.replace(path, path, {
      shallow: true,
      scroll: false,
    });
  }, [router]);

  const value = useMemo<ContextValue>(
    () => ({
      current,
      open,
      close,
    }),
    [current, open, close],
  );

  return (
    <SidebarContext.Provider value={value}>
      {children}
      {current && (
        <ModalWrapper onOverlayClick={close}>
          {createElement(
            sidebarComponents[current] as any,
            {
              onRequestClose: close,
              openSidebar: open,
              ...omit(['sidebar'], router.query),
            } as any,
          )}
        </ModalWrapper>
      )}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarContext);
