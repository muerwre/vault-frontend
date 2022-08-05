import React, { useCallback, useEffect, useMemo, VFC } from "react";

import { isNil } from "ramda";

import { ProfileSidebarNotes } from "~/components/profile/ProfileSidebarNotes";
import { ProfileSidebarSettings } from "~/components/profile/ProfileSidebarSettings";
import { SidebarStack } from "~/components/sidebar/SidebarStack";
import { SidebarStackCard } from "~/components/sidebar/SidebarStackCard";
import { SidebarName } from "~/constants/sidebar";
import { ProfileSidebarMenu } from "~/containers/profile/ProfileSidebarMenu";
import { SidebarWrapper } from "~/containers/sidebars/SidebarWrapper";
import { useAuth } from "~/hooks/auth/useAuth";
import type { SidebarComponentProps } from "~/types/sidebar";

const tabs = ["profile", "bookmarks"] as const;
type TabName = typeof tabs[number];

interface ProfileSidebarProps
  extends SidebarComponentProps<SidebarName.Settings> {
  page?: TabName;
}

const ProfileSidebar: VFC<ProfileSidebarProps> = ({
  onRequestClose,
  page,
  openSidebar,
}) => {
  const { isUser } = useAuth();

  const tab = useMemo(
    () => (page ? Math.max(tabs.indexOf(page), 0) : undefined),
    [page],
  );

  const onTabChange = useCallback(
    (val: number | undefined) => {
      openSidebar(SidebarName.Settings, {
        page: !isNil(val) ? tabs[val] : undefined,
      });
    },
    [open, onRequestClose],
  );

  useEffect(() => {
    if (!isUser) {
      onRequestClose();
    }
  }, [isUser]);

  if (!isUser) {
    return null;
  }

  return (
    <SidebarWrapper onClose={onRequestClose}>
      <SidebarStack tab={tab} onTabChange={onTabChange}>
        <SidebarStackCard
          headerFeature="close"
          title="Профиль"
          onBackPress={onRequestClose}
        >
          <ProfileSidebarMenu onClose={onRequestClose} />
        </SidebarStackCard>

        <SidebarStack.Cards>
          <ProfileSidebarSettings />
          <ProfileSidebarNotes />
        </SidebarStack.Cards>
      </SidebarStack>
    </SidebarWrapper>
  );
};

export { ProfileSidebar };
