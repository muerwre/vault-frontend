import React, { VFC } from 'react';

import { Group } from '~/components/common/Group';
import { Icon } from '~/components/common/Icon';
import { Button } from '~/components/input/Button';

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

    <Button onClick={onClick}>Ура!</Button>
  </Group>
);

export { RestoreSuccess };
