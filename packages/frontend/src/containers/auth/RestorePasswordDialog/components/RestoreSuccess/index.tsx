import { VFC } from 'react';

import { CheckIcon } from 'lucide-react';

import { Group } from '~/components/common/Group';
import { Button } from '~/components/input/Button';

import styles from './styles.module.scss';

interface RestoreSuccessProps {
  username?: string;
  onClick: () => void;
}

const RestoreSuccess: VFC<RestoreSuccessProps> = ({ username, onClick }) => (
  <Group className={styles.shade}>
    <CheckIcon size={64} />

    <div>Пароль обновлен</div>
    <div>Добро пожаловать домой{username ? `, ~${username}` : ''}!</div>

    <div />

    <Button onClick={onClick}>Ура!</Button>
  </Group>
);

export { RestoreSuccess };
