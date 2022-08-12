import { ProfileSidebar } from "~/containers/sidebars/ProfileSidebar";

import { SidebarName } from "./index";

export const sidebarComponents = {
  [SidebarName.Settings]: ProfileSidebar,
};

export type SidebarComponents = typeof sidebarComponents;
