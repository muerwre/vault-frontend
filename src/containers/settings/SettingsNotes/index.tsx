import { FC, useCallback, useState, VFC } from 'react';

import { Filler } from '~/components/containers/Filler';
import { Group } from '~/components/containers/Group';
import { Button } from '~/components/input/Button';
import { NoteCard } from '~/components/notes/NoteCard';
import { NoteCreationForm } from '~/components/notes/NoteCreationForm';
import { useConfirmation } from '~/hooks/dom/useConfirmation';
import { NoteProvider, useNotesContext } from '~/utils/providers/NoteProvider';

import styles from './styles.module.scss';

interface SettingsNotesProps {}

const List = () => {
  const { notes, remove, update } = useNotesContext();
  const confirm = useConfirmation();

  const onRemove = useCallback(
    async (id: number) => {
      confirm('Удалить? Это удалит заметку навсегда', () => remove(id));
    },
    [confirm, remove],
  );

  return (
    <>
      {notes.map((note) => (
        <NoteCard
          remove={() => onRemove(note.id)}
          update={(text, callback) => update(note.id, text, callback)}
          key={note.id}
          content={note.content}
          createdAt={note.created_at}
        />
      ))}
    </>
  );
};

const Form: FC<{ onCancel: () => void }> = ({ onCancel }) => {
  const { create: submit } = useNotesContext();
  return <NoteCreationForm onSubmit={submit} onCancel={onCancel} />;
};

const SettingsNotes: VFC<SettingsNotesProps> = () => {
  const [formIsShown, setFormIsShown] = useState(false);

  return (
    <NoteProvider>
      <div className={styles.grid}>
        <div className={styles.head}>
          {formIsShown ? (
            <Form onCancel={() => setFormIsShown(false)} />
          ) : (
            <Group className={styles.showForm} horizontal>
              <Filler />
              <Button
                onClick={() => setFormIsShown(true)}
                size="mini"
                iconRight="plus"
              >
                Добавить
              </Button>
            </Group>
          )}
        </div>
        <div className={styles.list}>
          <Group>
            <Group>
              <List />
            </Group>
          </Group>
        </div>
      </div>
    </NoteProvider>
  );
};

export { SettingsNotes };
