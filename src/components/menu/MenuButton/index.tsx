import React, { FC, ReactNode, useState } from 'react';

import { Placement } from '@popperjs/core';
import classNames from 'classnames';
import { usePopper } from 'react-popper';

import { Icon } from '~/components/input/Icon';
import { useFocusEvent } from '~/hooks/dom/useFocusEvent';

import styles from './styles.module.scss';

interface MenuButtonProps {
  position?: Placement;
  icon?: ReactNode;
  className?: string;
  activate?: 'hover' | 'focus';
  fixed?: boolean;
  translucent?: boolean;
}

const MenuButton: FC<MenuButtonProps> = ({
  position = 'auto',
  children,
  className,
  icon = <Icon icon="dots-vertical" size={24} />,
  translucent = true,
  activate = 'focus',
  fixed,
}) => {
  const focus = useFocusEvent(false, 150);
  const hover = useFocusEvent(false, 150);

  const [referenceElement, setReferenceElement] = useState<HTMLButtonElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null);

  const popper = usePopper(referenceElement, popperElement, {
    placement: position,
    strategy: fixed ? 'fixed' : 'absolute',
    modifiers: [
      { name: 'arrow', options: { element: arrowElement } },
      {
        name: 'offset',
        options: {
          offset: [0, 10],
        },
      },
      {
        name: 'preventOverflow',
        options: {
          padding: 10,
        },
      },
    ],
  });

  const visible = activate === 'focus' ? focus.focused : hover.focused;

  return (
    <>
      <button
        className={classNames(styles.menu, className)}
        ref={setReferenceElement}
        onFocus={focus.onFocus}
        onBlur={focus.onBlur}
        onMouseOver={hover.onFocus}
        onMouseOut={hover.onBlur}
      >
        {icon}
      </button>

      <div
        style={popper.styles.popper}
        ref={setPopperElement}
        {...popper.attributes.popper}
        className={classNames(styles.popper, {
          [styles.fixed]: fixed,
          [styles.translucent]: translucent,
          [styles.visible]: visible,
        })}
      >
        <div style={popper.styles.arrow} ref={setArrowElement} className={styles.arrow} />
        {children}
      </div>
    </>
  );
};

export { MenuButton };
