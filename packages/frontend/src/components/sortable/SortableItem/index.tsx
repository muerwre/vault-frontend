import { FC } from 'react';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import classNames from 'classnames';

import styles from './styles.module.scss';

interface SortableImageGridItemProps {
  id: number | string;
  disabled?: boolean;
  className?: string;
}

const SortableItem: FC<SortableImageGridItemProps> = ({
  children,
  id,
  disabled = false,
  className,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id,
      disabled,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={classNames(styles.item, className)}
    >
      {children}
    </div>
  );
};

export { SortableItem };
