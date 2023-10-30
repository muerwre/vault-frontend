import { FunctionComponent } from 'react';

import type { SidebarComponents } from '~/constants/sidebar/components';

export type SidebarComponent = keyof SidebarComponents;

// TODO: use it to store props for sidebar
export type SidebarProps<
  T extends SidebarComponent
> = SidebarComponents[T] extends FunctionComponent<infer U>
  ? U extends object
    ? U extends SidebarComponentProps<T>
      ? Omit<U, keyof SidebarComponentProps<T>>
      : U
    : U
  : {};
export interface SidebarComponentProps<T extends SidebarComponent> {
  onRequestClose: () => void;
  openSidebar: (name: T, props: SidebarProps<T>) => void;
}
