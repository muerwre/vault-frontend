import React, { VFC } from 'react';
import { SidebarWrapper } from '~/containers/sidebars/SidebarWrapper';
import styles from './styles.module.scss';
import { DialogComponentProps } from '~/types/modal';
import markdown from '~/styles/common/markdown.module.scss';
import { Button } from '~/components/input/Button';
import { Filler } from '~/components/containers/Filler';
import { ProfileSidebarHead } from '~/containers/profile/ProfileSidebarHead';
import classNames from 'classnames';
import { Group } from '~/components/containers/Group';
import { Card } from '~/components/containers/Card';
import { Grid } from '~/components/containers/Grid';
import { Square } from '~/components/common/Square';
import { Padder } from '~/components/containers/Padder';
import { useUser } from '~/hooks/auth/useUser';

interface ProfileSidebarProps extends DialogComponentProps {}

const ProfileSidebar: VFC<ProfileSidebarProps> = ({ onRequestClose }) => {
  const { user } = useUser();

  return (
    <SidebarWrapper onClose={onRequestClose}>
      <div className={styles.wrap}>
        <div className={styles.content}>
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

          <Button round onClick={onRequestClose} color="secondary">
            Закрыть
          </Button>
        </div>
      </div>
    </SidebarWrapper>
  );
};

export { ProfileSidebar };
