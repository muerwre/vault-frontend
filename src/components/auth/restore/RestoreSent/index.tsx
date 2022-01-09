import React, { VFC } from 'react';
import styles from './styles.module.scss';
import { Icon } from '~/components/input/Icon';
import { Button } from '~/components/input/Button';
import { Group } from '~/components/containers/Group';

interface RestoreSentProps {
  onClose: () => void;
}

const RestoreSent: VFC<RestoreSentProps> = ({ onClose }) => (
  <Group className={styles.shade}>
    <Icon icon="check" size={64} />

    <div>Проверьте почту, мы отправили на неё код</div>

    <div />

    <Button color="secondary" onClick={onClose}>
      Отлично!
    </Button>
  </Group>
);

export { RestoreSent };
