import { VFC } from 'react';

import Tippy from '@tippyjs/react';
import {
  EllipsisVerticalIcon,
  LockIcon,
  LockOpenIcon,
  PencilIcon,
  StarIcon,
} from 'lucide-react';

import { StarFilledIcon } from '~/components/icons';
import { MenuButton } from '~/components/menu/MenuButton';
import { MenuItemWithIcon } from '~/components/menu/MenuItemWithIcon';
import { SeparatedMenu } from '~/components/menu/SeparatedMenu';
import { useWindowSize } from '~/hooks/dom/useWindowSize';

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
        icon={<EllipsisVerticalIcon size={20} />}
        className={className}
      >
        {canStar && (
          <MenuItemWithIcon
            icon={
              isHeroic ? <StarFilledIcon size={20} /> : <StarIcon size={20} />
            }
            onClick={onStar}
          >
            {isHeroic ? 'Убрать с главной' : 'На главную'}
          </MenuItemWithIcon>
        )}

        <MenuItemWithIcon icon={<PencilIcon size={20} />} onClick={onEdit}>
          Редактировать
        </MenuItemWithIcon>

        <MenuItemWithIcon
          icon={isLocked ? <LockIcon size={20} /> : <LockOpenIcon size={20} />}
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
            {isHeroic ? <StarFilledIcon size={21} /> : <StarIcon size={21} />}
          </button>
        </Tippy>
      )}

      <Tippy content="Редактировать">
        <button className={className} onClick={onEdit}>
          <PencilIcon size={21} />
        </button>
      </Tippy>

      <Tippy content={isLocked ? 'Восстановить' : 'Удалить'}>
        <button className={className} onClick={onLock}>
          {isLocked ? <LockIcon size={21} /> : <LockOpenIcon size={21} />}
        </button>
      </Tippy>
    </SeparatedMenu>
  );
};

export { NodeEditMenu };
