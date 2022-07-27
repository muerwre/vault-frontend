import { FC, ReactNode } from "react";

import { ProfileSidebar } from "~/containers/sidebars/ProfileSidebar";

export enum SidebarName {
  Settings = 'settings'
}

export const sidebarComponents = {
  [SidebarName.Settings]: ProfileSidebar
}