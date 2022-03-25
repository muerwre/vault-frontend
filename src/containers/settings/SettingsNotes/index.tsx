import React, { useState, VFC } from 'react';

import Masonry from 'react-masonry-css';

import { Card } from '~/components/containers/Card';
import { Filler } from '~/components/containers/Filler';
import { Group } from '~/components/containers/Group';
import { Padder } from '~/components/containers/Padder';
import { Button } from '~/components/input/Button';
import { Icon } from '~/components/input/Icon';
import { InputText } from '~/components/input/InputText';
import { Textarea } from '~/components/input/Textarea';
import { HorizontalMenu } from '~/components/menu/HorizontalMenu';

import styles from './styles.module.scss';

interface SettingsNotesProps {}

const breakpointCols = {
  default: 2,
  1280: 1,
};

const sampleNotes = [...new Array(40)].map((_, i) => (
  <Card key={i} style={{ height: Math.random() * 400 + 50 }}>
    {i}
  </Card>
));

const SettingsNotes: VFC<SettingsNotesProps> = () => {
  const [text, setText] = useState('');

  return (
    <div>
      <Padder>
        <Group horizontal>
          <HorizontalMenu>
            <HorizontalMenu.Item active>Новые</HorizontalMenu.Item>
            <HorizontalMenu.Item>Старые</HorizontalMenu.Item>
          </HorizontalMenu>

          <Filler />

          <InputText suffix={<Icon icon="search" size={24} />} />
        </Group>
      </Padder>

      <Masonry
        className={styles.wrap}
        breakpointCols={breakpointCols}
        columnClassName={styles.column}
      >
        <Card>
          <Group>
            <Textarea handler={setText} value={text} />

            <Group horizontal>
              <Filler />
              <Button size="mini">Добавить</Button>
            </Group>
          </Group>
        </Card>

        {sampleNotes}
      </Masonry>
    </div>
  );
};

export { SettingsNotes };
