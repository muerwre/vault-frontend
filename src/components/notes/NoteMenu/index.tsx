import React, { useMemo, VFC } from 'react';

import { CornerMenu } from '~/components/menu/CornerMenu';

interface NoteMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

const NoteMenu: VFC<NoteMenuProps> = ({ onEdit, onDelete }) => {
  const actions = useMemo(
    () => [
      {
        title: 'Редактировать',
        action: onEdit,
      },
      { title: 'Удалить', action: onDelete },
    ],
    [onEdit, onDelete],
  );

  return <CornerMenu actions={actions} />;
};

export { NoteMenu };
