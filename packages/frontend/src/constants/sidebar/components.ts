import { SettingsSidebar } from '~/containers/sidebars/ProfileSidebar';
import { TagSidebar } from '~/containers/sidebars/TagSidebar';

import { SidebarName } from './index';

export const sidebarComponents = {
  [SidebarName.Settings]: SettingsSidebar,
  [SidebarName.Tag]: TagSidebar,
};

export type SidebarComponents = typeof sidebarComponents;
