import React, { VFC } from 'react';
import { SidebarWrapper } from '~/containers/sidebars/SidebarWrapper';
import styles from './styles.module.scss';
import { DialogComponentProps } from '~/types/modal';
import markdown from '~/styles/common/markdown.module.scss';
import { Button } from '~/components/input/Button';
import { Filler } from '~/components/containers/Filler';
import { ProfileSidebarHead } from '~/containers/profile/ProfileSidebarHead';
import classNames from 'classnames';

interface ProfileSidebarProps extends DialogComponentProps {}

const ProfileSidebar: VFC<ProfileSidebarProps> = ({ onRequestClose }) => {
  return (
    <SidebarWrapper onClose={onRequestClose}>
      <div className={styles.wrap}>
        <div className={styles.content}>
          <div>
            <ProfileSidebarHead />
          </div>

          <Filler className={classNames(markdown.wrapper, styles.text)}>
            <h3>Здесь будет профиль</h3>

            <p>
              Но пока что мы просто тестируем как это будет выглядеть и будет ли это удобнее модалки
            </p>
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
