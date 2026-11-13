import { Fragment, useCallback, useEffect, useMemo, VFC } from 'react';

import { CoverBackdrop } from '~/components/common/CoverBackdrop';
import { ProfileSidebarNotes } from '~/components/profile/ProfileSidebarNotes';
import { ProfileSidebarNotifications } from '~/components/profile/ProfileSidebarNotifications';
import { ProfileSidebarSettings } from '~/components/profile/ProfileSidebarSettings';
import { SidebarStack } from '~/components/sidebar/SidebarStack';
import { SidebarStackCard } from '~/components/sidebar/SidebarStackCard';
import { SidebarWrapper } from '~/components/sidebar/SidebarWrapper';
import { features } from '~/constants/features';
import { SidebarName } from '~/constants/sidebar';
import { ProfileSidebarMenu } from '~/containers/profile/ProfileSidebarMenu';
import { useAuth } from '~/hooks/auth/useAuth';
import type { SidebarComponentProps } from '~/types/sidebar';
import { isNil } from '~/utils/ramda';

const tabs = ['profile', 'notifications', 'bookmarks'] as const;
type TabName = (typeof tabs)[number];

interface SettingsSidebarProps
  extends SidebarComponentProps<SidebarName.Settings> {
  page?: TabName;
}

const SettingsSidebar: VFC<SettingsSidebarProps> = ({
  onRequestClose,
  page,
  openSidebar,
}) => {
  const { isUser } = useAuth();
  const cover = false;

  const tab = useMemo(() => {
    if (!page || (page === 'notifications' && !features.notifications)) {
      return undefined;
    }

    return Math.max(tabs.indexOf(page), 0);
  }, [page]);

  const onTabChange = useCallback(
    (val: number | undefined) => {
      openSidebar(SidebarName.Settings, {
        page: !isNil(val) ? tabs[val] : undefined,
      });
    },
    [openSidebar],
  );

  useEffect(() => {
    if (!isUser) {
      onRequestClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUser]);

  if (!isUser) {
    return null;
  }

  return (
    <SidebarWrapper
      onClose={onRequestClose}
      backdrop={cover && <CoverBackdrop cover={cover} />}
    >
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
          {/* Cards are picked by index, so a disabled tab keeps its slot */}
          {features.notifications ? (
            <ProfileSidebarNotifications />
          ) : (
            <Fragment />
          )}
          <ProfileSidebarNotes />
        </SidebarStack.Cards>
      </SidebarStack>
    </SidebarWrapper>
  );
};

export { SettingsSidebar };
