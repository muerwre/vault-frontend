import React, { FC, ReactComponentElement, DetailsHTMLAttributes, useEffect, useRef } from 'react';
import styles from './styles.scss';
import StickySidebar from 'sticky-sidebar';
import classnames from 'classnames';
import ResizeSensor from 'resize-sensor';

interface IProps extends DetailsHTMLAttributes<HTMLDivElement> {}

(window as any).StickySidebar = StickySidebar;
(window as any).ResizeSensor = ResizeSensor;

const Sticky: FC<IProps> = ({ children }) => {
  const ref = useRef(null);
  let sb = null;

  useEffect(() => {
    if (!ref.current) return;

    sb = new StickySidebar(ref.current, {
      resizeSensor: true,
      topSpacing: 72,
      bottomSpacing: 10,
    });

    return () => sb.destroy();
  }, [ref.current, children]);

  if (sb) {
    sb.updateSticky();
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
