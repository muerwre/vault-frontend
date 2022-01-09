import React, { VFC } from 'react';
import { Icon } from '~/components/input/Icon';
import { Button } from '~/components/input/Button';
import { Group } from '~/components/containers/Group';
import styles from './styles.module.scss';

interface RestoreSuccessProps {
  username?: string;
  onClick: () => void;
}

const RestoreSuccess: VFC<RestoreSuccessProps> = ({ username, onClick }) => (
  <Group className={styles.shade}>
    <Icon icon="check" size={64} />

    <div>Пароль обновлен</div>
    <div>Добро пожаловать домой{username ? `, ~${username}` : ''}!</div>

    <div />

    <Button color="secondary" onClick={onClick}>
      Ура!
    </Button>
  </Group>
);

export { RestoreSuccess };