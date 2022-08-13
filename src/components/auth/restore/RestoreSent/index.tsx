import React, { VFC } from 'react';

import { Group } from '~/components/containers/Group';
import { Button } from '~/components/input/Button';
import { Icon } from '~/components/input/Icon';

import styles from './styles.module.scss';

interface RestoreSentProps {
  onClose: () => void;
}

const RestoreSent: VFC<RestoreSentProps> = ({ onClose }) => (
  <Group className={styles.shade}>
    <Icon icon="check" size={64} />

    <div>Проверьте почту, мы отправили на неё код</div>

    <div />

    <Button onClick={onClose}>Отлично!</Button>
  </Group>
);

export { RestoreSent };
