import { FC } from 'react';

import { Group } from '~/components/common/Group';
import { Padder } from '~/components/common/Padder';
import { Button } from '~/components/input/Button';
import { MenuButton } from '~/components/menu/MenuButton';

import styles from './styles.module.scss';

interface ProfileSidebarLogoutButtonProps {
  onLogout?: () => void;
}

const ProfileSidebarLogoutButton: FC<ProfileSidebarLogoutButtonProps> = ({
  onLogout,
}) => (
  <MenuButton
    icon={
      <Button color="link" iconRight="logout">
        Выйти
      </Button>
    }
    position="top-end"
  >
    <Padder className={styles.wrapper}>
      <Group>
        <h5>Захотелось наружу?</h5>
        <div>Там холодно, страшно и больше не раздают пончики!</div>
        <div />
        <div>
          <Button onClick={onLogout} color="primary" stretchy>
            Выпустите меня!
          </Button>
        </div>
      </Group>
    </Padder>
  </MenuButton>
);

export { ProfileSidebarLogoutButton };
