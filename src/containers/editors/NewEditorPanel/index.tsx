import React, { FC } from 'react';
import styles from './styles.module.scss';
import { TextInput } from '~/components/input/TextInput';
import { Filler } from '~/components/containers/Filler';
import { Button } from '~/components/input/Button';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { Group } from '~/components/containers/Group';

interface IProps {}

const NewEditorPanel: FC<IProps> = () => (
  <div className={styles.wrap}>
    <Group>
      <div className={styles.title}>
        <TextInput onChange={console.log} label="Название" />
      </div>

      <Placeholder width="100%" height={60} />

      <Placeholder width="100%" height={120} />
    </Group>

    <Filler />

    <Button color="primary">Сохранить</Button>
  </div>
);

export { NewEditorPanel };
