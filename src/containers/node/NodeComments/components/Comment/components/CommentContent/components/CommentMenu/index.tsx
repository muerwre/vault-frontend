import { FC, useMemo } from 'react';

import { CornerMenu } from '~/components/menu/CornerMenu';

interface Props {
  onEdit: () => void;
  onDelete: () => void;
}

const CommentMenu: FC<Props> = ({ onEdit, onDelete }) => {
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

export { CommentMenu };
