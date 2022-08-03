import { FC, useState, VFC } from "react";

import { Filler } from "~/components/containers/Filler";
import { Group } from "~/components/containers/Group";
import { Button } from "~/components/input/Button";
import { NoteCard } from "~/components/notes/NoteCard";
import { NoteCreationForm } from "~/components/notes/NoteCreationForm";
import { NoteProvider, useNotesContext } from "~/utils/providers/NoteProvider";

import styles from "./styles.module.scss";

interface SettingsNotesProps {}

const List = () => {
  const { notes } = useNotesContext();

  return (
    <>
      {notes.map(note => (
        <NoteCard
          key={note.id}
          content={note.content}
          createdAt={note.created_at}
        />
      ))}
    </>
  );
};

const Form: FC<{ onCancel: () => void }> = ({ onCancel }) => {
  const { submit } = useNotesContext();
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
                color="secondary"
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
