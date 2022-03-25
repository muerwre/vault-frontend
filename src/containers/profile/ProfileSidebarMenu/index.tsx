import React, { VFC } from 'react';

import classNames from 'classnames';

import { Square } from '~/components/common/Square';
import { Card } from '~/components/containers/Card';
import { Filler } from '~/components/containers/Filler';
import { Grid } from '~/components/containers/Grid';
import { Group } from '~/components/containers/Group';
import { Button } from '~/components/input/Button';
import { VerticalMenu } from '~/components/menu/VerticalMenu';
import { useStackContext } from '~/components/sidebar/SidebarStack';
import { ProfileSidebarHead } from '~/containers/profile/ProfileSidebarHead';
import { ProfileStats } from '~/containers/profile/ProfileStats';
import markdown from '~/styles/common/markdown.module.scss';

import styles from './styles.module.scss';

interface ProfileSidebarMenuProps {
  onClose: () => void;
}

const ProfileSidebarMenu: VFC<ProfileSidebarMenuProps> = ({ onClose }) => {
  const { setActiveTab } = useStackContext();

  return (
    <div className={styles.wrap}>
      <div>
        <ProfileSidebarHead />
      </div>

      <Filler className={classNames(markdown.wrapper, styles.text)}>
        <Group>
          <VerticalMenu className={styles.menu}>
            <VerticalMenu.Item onClick={() => setActiveTab(0)}>Настройки</VerticalMenu.Item>
            <VerticalMenu.Item onClick={() => setActiveTab(1)}>Заметки</VerticalMenu.Item>
            <VerticalMenu.Item onClick={() => setActiveTab(2)}>Удалённые посты</VerticalMenu.Item>
          </VerticalMenu>

          <ProfileStats />
        </Group>
      </Filler>

      <Button round onClick={onClose} color="secondary">
        Закрыть
      </Button>
    </div>
  );
};

export { ProfileSidebarMenu };
