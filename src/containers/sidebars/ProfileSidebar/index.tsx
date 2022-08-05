import { useCallback, useMemo, VFC } from "react";

import { isNil } from "ramda";

import { ProfileSidebarNotes } from "~/components/profile/ProfileSidebarNotes";
import { ProfileSidebarSettings } from "~/components/profile/ProfileSidebarSettings";
import { SidebarStack } from "~/components/sidebar/SidebarStack";
import { SidebarStackCard } from "~/components/sidebar/SidebarStackCard";
import { SidebarName } from "~/constants/sidebar";
import { ProfileSidebarMenu } from "~/containers/profile/ProfileSidebarMenu";
import { SidebarWrapper } from "~/containers/sidebars/SidebarWrapper";
import { SidebarComponentProps } from "~/types/sidebar";
import { useSidebar } from "~/utils/providers/SidebarProvider";

type TabName = "profile" | "bookmarks";
interface ProfileSidebarProps extends SidebarComponentProps {
  page?: TabName;
}

const tabs: TabName[] = ["profile", "bookmarks"];

const ProfileSidebar: VFC<ProfileSidebarProps> = ({ onRequestClose, page }) => {
  const initialTab = useMemo(
    () => (page ? Math.min(tabs.indexOf(page), 0) : undefined),
    [page],
  );

  const { open } = useSidebar();

  const onTabChange = useCallback(
    (val: number | undefined) => {
      console.log({ val });
      open(SidebarName.Settings, { page: !isNil(val) ? tabs[val] : undefined });
    },
    [open],
  );

  return (
    <SidebarWrapper onClose={onRequestClose}>
      <SidebarStack tab={initialTab} onTabChange={onTabChange}>
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
