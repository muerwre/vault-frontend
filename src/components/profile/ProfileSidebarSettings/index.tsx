import React, { FC } from 'react';

import { Filler } from '~/components/containers/Filler';
import { Button } from '~/components/input/Button';
import { ProfileSettings } from '~/components/profile/ProfileSettings';
import { useStackContext } from '~/components/sidebar/SidebarStack';
import { SidebarStackCard } from '~/components/sidebar/SidebarStackCard';

import styles from './styles.module.scss';

interface IProps {}

const ProfileSidebarSettings: FC<IProps> = () => {
  const { closeAllTabs } = useStackContext();

  return (
    <SidebarStackCard width={600} headerFeature="back" title="Настройки" onBackPress={closeAllTabs}>
      <div className={styles.wrap}>
        <div className={styles.scroller}>
          <ProfileSettings />
        </div>

        <div className={styles.buttons}>
          <Filler />
          <Button color="outline" onClick={closeAllTabs}>
            Отмена
          </Button>

          <Button color="secondary">Сохранить</Button>
        </div>
      </div>
    </SidebarStackCard>
  );
};

export { ProfileSidebarSettings };
