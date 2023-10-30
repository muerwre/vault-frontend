import React, { useCallback, useState, VFC } from 'react';

import { Card } from '~/components/containers/Card';
import { Markdown } from '~/components/containers/Markdown';
import { Padder } from '~/components/containers/Padder';
import { NoteMenu } from '~/components/notes/NoteMenu';
import { formatText, getPrettyDate } from '~/utils/dom';

import { NoteCreationForm } from '../NoteCreationForm';

import styles from './styles.module.scss';

interface NoteCardProps {
  content: string;
  remove: () => Promise<void>;
  update: (text: string, callback?: () => void) => Promise<void>;
  createdAt: string;
}

const NoteCard: VFC<NoteCardProps> = ({
  content,
  createdAt,
  remove,
  update,
}) => {
  const [editing, setEditing] = useState(false);

  const toggleEditing = useCallback(() => setEditing((v) => !v), []);
  const onUpdate = useCallback(
    (text: string, callback?: () => void) =>
      update(text, () => {
        setEditing(false);
        callback?.();
      }),
    [update],
  );

  return (
    <Card className={styles.note}>
      {editing ? (
        <NoteCreationForm
          text={content}
          onSubmit={onUpdate}
          onCancel={toggleEditing}
        />
      ) : (
        <>
          <Padder>
            <NoteMenu onEdit={toggleEditing} onDelete={remove} />

            <Markdown className={styles.wrap}>{formatText(content)}</Markdown>
          </Padder>

          <Padder className={styles.footer}>{getPrettyDate(createdAt)}</Padder>
        </>
      )}
    </Card>
  );
};

export { NoteCard };
