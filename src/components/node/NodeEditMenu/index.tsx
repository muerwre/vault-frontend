import React, { VFC } from 'react';

import classNames from 'classnames';

import { Icon } from '~/components/input/Icon';

import styles from './styles.module.scss';

interface NodeEditMenuProps {
  canStar: boolean;

  isHeroic: boolean;
  isLocked: boolean;

  onStar: () => void;
  onLock: () => void;
  onEdit: () => void;
}

const NodeEditMenu: VFC<NodeEditMenuProps> = ({
  canStar,
  isHeroic,
  isLocked,
  onStar,
  onLock,
  onEdit,
}) => (
  <div className={styles.editor_menu}>
    <div className={styles.editor_menu_button}>
      <Icon icon="dots-vertical" size={24} />
    </div>

    <div className={styles.editor_buttons}>
      {canStar && (
        <div className={classNames(styles.star, { [styles.is_heroic]: isHeroic })}>
          {isHeroic ? (
            <Icon icon="star_full" size={24} onClick={onStar} />
          ) : (
            <Icon icon="star" size={24} onClick={onStar} />
          )}
        </div>
      )}

      <div>
        <Icon icon={isLocked ? 'locked' : 'unlocked'} size={24} onClick={onLock} />
      </div>

      <Icon icon="edit" size={24} onClick={onEdit} />
    </div>
  </div>
);

export { NodeEditMenu };
