import React, { FC, ReactNode } from 'react';

import classNames from 'classnames';
import { Manager, Popper, Reference } from 'react-popper';

import { Icon } from '~/components/input/Icon';
import { useFocusEvent } from '~/hooks/dom/useFocusEvent';

import styles from './styles.module.scss';

interface MenuButtonProps {
  icon?: ReactNode;
  className?: string;
}

const modifiers = [
  {
    name: 'offset',
    options: {
      offset: [5, 10],
    },
  },
];

const MenuButton: FC<MenuButtonProps> = ({
  children,
  className,
  icon = <Icon icon="dots-vertical" size={24} />,
}) => {
  const { focused, onFocus, onBlur } = useFocusEvent(false, 150);

  return (
    <Manager>
      <Reference>
        {({ ref }) => (
          <button
            className={classNames(styles.menu, className)}
            ref={ref}
            onFocus={onFocus}
            onBlur={onBlur}
          >
            {icon}
          </button>
        )}
      </Reference>

      {focused && (
        <Popper placement="bottom-end" modifiers={modifiers}>
          {({ style, ref, placement }) => (
            <div
              style={style}
              ref={ref}
              className={classNames(styles.popper, { [styles.top]: placement === 'top-end' })}
            >
              {children}
            </div>
          )}
        </Popper>
      )}
    </Manager>
  );
};

export { MenuButton };
