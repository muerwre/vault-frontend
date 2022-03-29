import React, { VFC } from 'react';

import { useStackContext } from '~/components/sidebar/SidebarStack';
import { SidebarStackCard } from '~/components/sidebar/SidebarStackCard';
import { SettingsNotes } from '~/containers/settings/SettingsNotes';

import styles from './styles.module.scss';

interface ProfileSidebarNotesProps {}

const ProfileSidebarNotes: VFC<ProfileSidebarNotesProps> = () => {
  const { closeAllTabs } = useStackContext();

  return (
    <SidebarStackCard width={800} headerFeature="back" title="Заметки" onBackPress={closeAllTabs}>
      <div className={styles.scroller}>
        <SettingsNotes />
      </div>
    </SidebarStackCard>
  );
};

export { ProfileSidebarNotes };
