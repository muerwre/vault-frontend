import { FC, ReactNode } from 'react';

import classNames from 'classnames';
import {
  EighthNotesIcon,
  ImagePlusIcon,
  RectangleLandscapePlayIcon,
  TextAlignStartIcon,
} from 'lucide-react';

import { BlockType, TEXT_NODE_BLOCKS } from '~/utils/blocks';

import styles from './styles.module.scss';

const BLOCK_BUTTONS: Record<BlockType, { icon: ReactNode; label: string }> = {
  text: { icon: <TextAlignStartIcon size={16} />, label: 'Текст' },
  images: { icon: <ImagePlusIcon size={16} />, label: 'Фото' },
  video: { icon: <RectangleLandscapePlayIcon size={16} />, label: 'Видео' },
  audio: { icon: <EighthNotesIcon size={16} />, label: 'Музыка' },
};

interface Props {
  onInsert: (type: BlockType) => void;
  /** Hidden while a block is dragged, keeping its place so nothing jumps. */
  hidden?: boolean;
  disabled?: boolean;
  /** Types the post holds its limit of, whose buttons are turned off. */
  full?: BlockType[];
}

/** The separator around blocks: a button for each kind of block to insert. */
const SubmitBlockInserter: FC<Props> = ({
  onInsert,
  hidden,
  disabled,
  full = [],
}) => (
  <div className={classNames(styles.wrap, { [styles.hidden]: hidden })}>
    <div className={styles.buttons}>
      {TEXT_NODE_BLOCKS.map((type) => (
        <button
          key={type}
          type="button"
          className={styles.button}
          onClick={() => onInsert(type)}
          disabled={disabled || full.includes(type)}
          title={
            full.includes(type)
              ? 'В посте уже максимум такого'
              : BLOCK_BUTTONS[type].label
          }
        >
          {BLOCK_BUTTONS[type].icon}
          <span className={styles.label}>{BLOCK_BUTTONS[type].label}</span>
        </button>
      ))}
    </div>
  </div>
);

export { SubmitBlockInserter };
