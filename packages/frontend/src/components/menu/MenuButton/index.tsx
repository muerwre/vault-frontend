import { FC, ReactNode, useEffect, useState } from 'react';

import { Placement } from '@popperjs/core';
import classNames from 'classnames';
import { EllipsisVerticalIcon } from 'lucide-react';
import { createPortal } from 'react-dom';
import { usePopper } from 'react-popper';

import { useFocusEvent } from '~/hooks/dom/useFocusEvent';

import styles from './styles.module.scss';

interface MenuButtonProps {
  position?: Placement;
  icon?: ReactNode;
  className?: string;
  activate?: 'hover' | 'focus';
  fixed?: boolean;
  translucent?: boolean;
  /**
   * Renders the menu on `<body>`. A backdrop blur inside an element with one
   * of its own, such as the scrolled header, would only blur that element.
   */
  portal?: boolean;
  /** What the menu and its arrow point at; the button itself by default. */
  anchor?: HTMLElement | null;
}

const MenuButton: FC<MenuButtonProps> = ({
  position = 'auto',
  children,
  className,
  icon = <EllipsisVerticalIcon size={24} />,
  translucent = true,
  activate = 'focus',
  fixed,
  portal,
  anchor,
}) => {
  // there is no body to portal into while rendering on the server
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const focus = useFocusEvent(false, 300);
  const hover = useFocusEvent(false, 300);

  const [referenceElement, setReferenceElement] =
    useState<HTMLButtonElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null,
  );
  const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null);

  const popper = usePopper(anchor ?? referenceElement, popperElement, {
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

  useEffect(() => {
    popper.update?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const popup = (
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
      <div
        style={popper.styles.arrow}
        ref={setArrowElement}
        className={styles.arrow}
      />
      {children}
    </div>
  );

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

      {portal && mounted ? createPortal(popup, document.body) : popup}
    </>
  );
};

export { MenuButton };
