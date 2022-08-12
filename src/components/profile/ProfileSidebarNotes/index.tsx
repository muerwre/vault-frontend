import { VFC } from 'react';

import { useStackContext } from '~/components/sidebar/SidebarStack';
import { SidebarStackCard } from '~/components/sidebar/SidebarStackCard';
import { SettingsNotes } from '~/containers/settings/SettingsNotes';

interface ProfileSidebarNotesProps {}

const ProfileSidebarNotes: VFC<ProfileSidebarNotesProps> = () => {
  const { closeAllTabs } = useStackContext();

  return (
    <SidebarStackCard
      width={480}
      headerFeature="back"
      title="Заметки"
      onBackPress={closeAllTabs}
    >
      <SettingsNotes />
    </SidebarStackCard>
  );
};

export { ProfileSidebarNotes };
