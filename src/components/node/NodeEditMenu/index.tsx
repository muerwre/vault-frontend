import { VFC } from 'react';

import Tippy from '@tippyjs/react';

import { Icon } from '~/components/common/Icon';
import { MenuButton } from '~/components/menu/MenuButton';
import { MenuItemWithIcon } from '~/components/menu/MenuItemWithIcon';
import { SeparatedMenu } from '~/components/menu/SeparatedMenu';
import { useWindowSize } from '~/hooks/dom/useWindowSize';

import styles from './styles.module.scss';

interface NodeEditMenuProps {
  className?: string;

  canStar: boolean;

  isHeroic: boolean;
  isLocked: boolean;

  onStar: () => void;
  onLock: () => void;
  onEdit: () => void;
}

const NodeEditMenu: VFC<NodeEditMenuProps> = ({
  className,
  canStar,
  isHeroic,
  isLocked,
  onStar,
  onLock,
  onEdit,
}) => {
  const { isTablet } = useWindowSize();

  if (isTablet) {
    return (
      <MenuButton
        icon={<Icon icon="dots-vertical" className={styles.icon} size={24} />}
        className={className}
      >
        {canStar && (
          <MenuItemWithIcon
            icon={isHeroic ? 'star_full' : 'star'}
            onClick={onStar}
          >
            {isHeroic ? 'Убрать с главной' : 'На главную'}
          </MenuItemWithIcon>
        )}

        <MenuItemWithIcon icon="edit" onClick={onEdit}>
          Редактировать
        </MenuItemWithIcon>

        <MenuItemWithIcon
          icon={isLocked ? 'locked' : 'unlocked'}
          onClick={onLock}
        >
          {isLocked ? 'Восстановить' : 'Удалить'}
        </MenuItemWithIcon>
      </MenuButton>
    );
  }

  return (
    <SeparatedMenu>
      {canStar && (
        <Tippy content={isHeroic ? 'Убрать с главной' : 'На главную'}>
          <button className={className} onClick={onStar}>
            <Icon icon={isHeroic ? 'star_full' : 'star'} size={24} />
          </button>
        </Tippy>
      )}

      <Tippy content="Редактировать">
        <button className={className} onClick={onEdit}>
          <Icon icon="edit" size={24} />
        </button>
      </Tippy>

      <Tippy content={isLocked ? 'Восстановить' : 'Удалить'}>
        <button className={className} onClick={onLock}>
          <Icon icon={isLocked ? 'locked' : 'unlocked'} size={24} />
        </button>
      </Tippy>
    </SeparatedMenu>
  );
};

export { NodeEditMenu };
