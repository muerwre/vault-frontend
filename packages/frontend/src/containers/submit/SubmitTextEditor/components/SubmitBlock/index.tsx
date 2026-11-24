import { FC, ReactNode } from 'react';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import classNames from 'classnames';
import { GripVerticalIcon, XIcon } from 'lucide-react';

import styles from './styles.module.scss';

interface Props {
  id: string;
  /** Shown above the block, moving with it: the separator to insert before. */
  before?: ReactNode;
  onRemove: () => void;
  /** Locks the block while the post saves, its content included. */
  disabled?: boolean;
  /** Keeps the block from being removed, while its uploads run, say. */
  removeDisabled?: boolean;
  /** Says why the cross is off. */
  removeHint?: string;
  children: ReactNode;
}

/**
 * A block of the text editor with a panel at its right: a handle that drags
 * it, and a cross that removes it. Only the handle starts a drag, so the
 * block's own inputs and grids keep their pointer.
 */
const SubmitBlock: FC<Props> = ({
  id,
  before,
  onRemove,
  disabled,
  removeDisabled,
  removeHint,
  children,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
      }}
      className={classNames(styles.wrap, { [styles.dragging]: isDragging })}
    >
      {before}

      <div className={styles.block}>
        <div
          className={classNames(styles.content, {
            [styles.locked]: disabled,
          })}
        >
          {children}
        </div>

        <div className={styles.panel}>
          <button
            type="button"
            ref={setActivatorNodeRef}
            className={classNames(styles.button, styles.handle)}
            aria-label="Перетащить блок"
            disabled={disabled}
            {...attributes}
            {...listeners}
          >
            <GripVerticalIcon size={20} />
          </button>

          <button
            type="button"
            className={classNames(styles.button, styles.remove)}
            onClick={onRemove}
            aria-label="Убрать блок"
            title={removeDisabled ? removeHint : undefined}
            disabled={disabled || removeDisabled}
          >
            <XIcon size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export { SubmitBlock };
