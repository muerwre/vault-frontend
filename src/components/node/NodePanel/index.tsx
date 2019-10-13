import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import * as styles from './styles.scss';
import { INode } from '~/redux/types';
import { createPortal } from 'react-dom';
import { NodePanelInner } from '~/components/node/NodePanelInner';

interface IProps {
  node: INode;
  layout: {};
}

const NodePanel: FC<IProps> = ({ node, layout }) => {
  const [stack, setStack] = useState(false);

  const ref = useRef(null);
  const getPlace = useCallback(() => {
    if (!ref.current) return;

    const { offsetTop } = ref.current;
    const { height } = ref.current.getBoundingClientRect();
    const { scrollY, innerHeight } = window;

    setStack(offsetTop > scrollY + innerHeight - height);
  }, [ref]);

  useEffect(() => {
    getPlace();
    window.addEventListener('scroll', getPlace);
    window.addEventListener('resize', getPlace);

    return () => {
      window.removeEventListener('scroll', getPlace);
      window.removeEventListener('resize', getPlace);
    };
  }, [layout]);

  return (
    <div className={styles.place} ref={ref}>
      {stack ? (
        createPortal(<NodePanelInner node={node} stack />, document.body)
      ) : (
        <NodePanelInner node={node} />
      )}
    </div>
  );
};

export { NodePanel };
