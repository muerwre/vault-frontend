import React, { VFC } from 'react';

import classNames from 'classnames';
import Link from 'next/link';

import { Filler } from '~/components/containers/Filler';
import { Group } from '~/components/containers/Group';
import { Button } from '~/components/input/Button';
import { VerticalMenu } from '~/components/menu/VerticalMenu';
import { URLS } from '~/constants/urls';
import { ProfileSidebarHead } from '~/containers/profile/ProfileSidebarHead';
import styles from '~/containers/profile/ProfileSidebarMenu/styles.module.scss';
import { ProfileStats } from '~/containers/profile/ProfileStats';

interface SettingsMenuProps {}

const SettingsMenu: VFC<SettingsMenuProps> = () => (
  <Group>
    <ProfileSidebarHead />

    <br />

    <Group>
      <VerticalMenu className={styles.menu}>
        <Link href={URLS.SETTINGS.BASE} passHref>
          <VerticalMenu.Item onClick={console.log}>Настройки</VerticalMenu.Item>
        </Link>

        <Link href={URLS.SETTINGS.NOTES} passHref>
          <VerticalMenu.Item onClick={console.log}>Заметки</VerticalMenu.Item>
        </Link>

        <Link href={URLS.SETTINGS.TRASH} passHref>
          <VerticalMenu.Item onClick={console.log}>Удалённые посты</VerticalMenu.Item>
        </Link>
      </VerticalMenu>

      <br />

      <ProfileStats />

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
