import React, { FC } from 'react';

import { Filler } from '~/components/containers/Filler';
import { Button } from '~/components/input/Button';
import { ProfileSettings } from '~/components/profile/ProfileSettings';
import { useStackContext } from '~/components/sidebar/SidebarStack';
import { SidebarStackCard } from '~/components/sidebar/SidebarStackCard';
import { UserSettingsView } from '~/containers/settings/UserSettingsView';
import {
  SettingsProvider,
  useSettings,
} from '~/utils/providers/SettingsProvider';

import styles from './styles.module.scss';

interface IProps {}

const Form = ({ children, className }) => {
  const { handleSubmit } = useSettings();

  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}
    </form>
  );
};

const ProfileSidebarSettings: FC<IProps> = () => {
  const { closeAllTabs } = useStackContext();

  return (
    <SidebarStackCard
      width={600}
      headerFeature="back"
      title="Настройки"
      onBackPress={closeAllTabs}
    >
      <SettingsProvider>
        <Form className={styles.wrap}>
          <div className={styles.scroller}>
            <UserSettingsView />
          </div>

          <div className={styles.buttons}>
            <Filler />
            <Button color="link" onClick={closeAllTabs}>
              Отмена
            </Button>

            <Button color="secondary" type="submit">
              Сохранить
            </Button>
          </div>
        </Form>
      </SettingsProvider>
    </SidebarStackCard>
  );
};

export { ProfileSidebarSettings };
