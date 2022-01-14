import React, { VFC } from 'react';
import styles from './styles.module.scss';
import { ProfileSidebarHead } from '~/containers/profile/ProfileSidebarHead';
import { Filler } from '~/components/containers/Filler';
import classNames from 'classnames';
import markdown from '~/styles/common/markdown.module.scss';
import { Group } from '~/components/containers/Group';
import { Grid } from '~/components/containers/Grid';
import { Card } from '~/components/containers/Card';
import { Square } from '~/components/common/Square';
import { Button } from '~/components/input/Button';

interface ProfileSidebarMenuProps {
  onClose: () => void;
}

const ProfileSidebarMenu: VFC<ProfileSidebarMenuProps> = ({ onClose }) => (
  <div className={styles.wrap}>
    <div>
      <ProfileSidebarHead />
    </div>

    <Filler className={classNames(markdown.wrapper, styles.text)}>
      <Group>
        <ul className={styles.menu}>
          <li>Настройки</li>
          <li>Заметки</li>
          <li>Удалённые посты</li>
        </ul>

        <Grid columns="2fr 1fr">
          <Card>
            <h4>1 год 2 месяца</h4>
            <small>в убежище</small>
          </Card>

          <Card>
            <Square>
              <h4>24 поста</h4>
              <small>Создано</small>
            </Square>
          </Card>
        </Grid>

        <Grid columns="1fr 2fr">
          <Card>
            <Square>
              <h4>16545 лайка</h4>
              <small>получено</small>
            </Square>
          </Card>

          <Card>
            <h4>123123 комментария</h4>
            <small>под постами</small>
          </Card>
        </Grid>
      </Group>
    </Filler>

    <Button round onClick={onClose} color="secondary">
      Закрыть
    </Button>
  </div>
);

export { ProfileSidebarMenu };
