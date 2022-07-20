import React, { useState, VFC } from 'react';

import { Card } from '~/components/containers/Card';
import { Columns } from '~/components/containers/Columns';
import { Filler } from '~/components/containers/Filler';
import { Group } from '~/components/containers/Group';
import { Padder } from '~/components/containers/Padder';
import { Button } from '~/components/input/Button';
import { Icon } from '~/components/input/Icon';
import { InputText } from '~/components/input/InputText';
import { Textarea } from '~/components/input/Textarea';
import { HorizontalMenu } from '~/components/menu/HorizontalMenu';
import { NoteCard } from '~/components/notes/NoteCard';
import { useGetNotes } from '~/hooks/notes/useGetNotes';

interface SettingsNotesProps {}

const SettingsNotes: VFC<SettingsNotesProps> = () => {
  const [text, setText] = useState('');
  const { notes } = useGetNotes('');

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

      <Columns>
        <Card>
          <Group>
            <Textarea handler={setText} value={text} />

            <Group horizontal>
              <Filler />
              <Button size="mini">Добавить</Button>
            </Group>
          </Group>
        </Card>

        {notes.map(note => (
          <NoteCard key={note.id} content={note.content} createdAt={note.created_at} />
        ))}
      </Columns>
    </div>
  );
};

export { SettingsNotes };
