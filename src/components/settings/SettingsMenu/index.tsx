import { VFC } from 'react';

import Link from 'next/link';

import { Filler } from '~/components/common/Filler';
import { Group } from '~/components/common/Group';
import { Button } from '~/components/input/Button';
import { VerticalMenu } from '~/components/menu/VerticalMenu';
import { URLS } from '~/constants/urls';
import { ProfileSidebarHead } from '~/containers/profile/ProfileSidebarHead';

import styles from './styles.module.scss';

interface SettingsMenuProps {}

const SettingsMenu: VFC<SettingsMenuProps> = () => (
  <Group>
    <ProfileSidebarHead />

    <Group>
      <VerticalMenu className={styles.menu}>
        <Link href={URLS.SETTINGS.BASE} passHref>
          <VerticalMenu.Item onClick={console.log}>Настройки</VerticalMenu.Item>
        </Link>

        <Link href={URLS.SETTINGS.NOTES} passHref>
          <VerticalMenu.Item onClick={console.log}>Заметки</VerticalMenu.Item>
        </Link>

        <Link href={URLS.SETTINGS.TRASH} passHref>
          <VerticalMenu.Item onClick={console.log}>
            Удалённые посты
          </VerticalMenu.Item>
        </Link>
      </VerticalMenu>

      <Group horizontal>
        <Filler />

        <Button color="outline" iconLeft="enter">
          Выйти
        </Button>
      </Group>
    </Group>
  </Group>
);

export { SettingsMenu };
