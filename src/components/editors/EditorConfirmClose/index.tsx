import React, { FC } from 'react';

import { Group } from '~/components/containers/Group';
import { Button } from '~/components/input/Button';

import styles from './styles.module.scss';

interface IProps {
  onApprove: () => void;
  onDecline: () => void;
}

const EditorConfirmClose: FC<IProps> = ({ onApprove, onDecline }) => (
  <div className={styles.wrap}>
    <Group className={styles.content}>
      <div className={styles.title}>Точно закрыть?</div>
      <div className={styles.subtitle}>
        Все изменения будут потеряны, воспоминания затёрты, очевидцы умрут, над миром воссияет
        ядерный рассвет.
      </div>

      <div />

      <Group horizontal>
        <Button color="gray" type="button" onClick={onApprove} autoFocus>
          Да
        </Button>

        <Button type="button" onClick={onDecline}>
          О боже, нет!
        </Button>
      </Group>
    </Group>
  </div>
);

export { EditorConfirmClose };
