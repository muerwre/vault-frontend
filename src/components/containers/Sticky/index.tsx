import React, { DetailsHTMLAttributes, FC, useEffect, useRef } from 'react';
import styles from './styles.module.scss';

import ResizeSensor from 'resize-sensor';
(window as any).ResizeSensor = ResizeSensor;

import StickySidebar from 'sticky-sidebar';
(window as any).StickySidebar = StickySidebar;

import classnames from 'classnames';

interface IProps extends DetailsHTMLAttributes<HTMLDivElement> {}

const Sticky: FC<IProps> = ({ children }) => {
  const ref = useRef(null);
  const sb = useRef<StickySidebar>(null);

  useEffect(() => {
    if (!ref.current) return;

    sb.current = new StickySidebar(ref.current, {
      resizeSensor: true,
      topSpacing: 72,
      bottomSpacing: 10,
    });

    return () => sb.current?.destroy();
  }, [ref.current, sb.current, children]);

  if (sb) {
    sb.current?.updateSticky();
  }

  return (
    <div className={classnames(styles.wrap, 'sidebar_container')}>
      <div className="sidebar" ref={ref}>
        <div className={classnames(styles.sticky, 'sidebar__inner')}>{children}</div>
      </div>
    </div>
  );
};

export { Sticky };
