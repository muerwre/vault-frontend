import React, { FC, useCallback, useEffect, useRef, useState, memo } from 'react';
import * as styles from './styles.scss';
import { INode } from '~/redux/types';
import { createPortal } from 'react-dom';
import { NodePanelInner } from '~/components/node/NodePanelInner';

interface IProps {
  node: INode;
  layout: {};

  can_edit: boolean;
  can_like: boolean;
  onEdit: () => void;
  onLike: () => void;
}

const NodePanel: FC<IProps> = memo(({ node, layout, can_edit, can_like, onEdit, onLike }) => {
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
        createPortal(
          <NodePanelInner
            node={node}
            stack
            onEdit={onEdit}
            onLike={onLike}
            can_edit={can_edit}
            can_like={can_like}
          />,
          document.body
        )
      ) : (
        <NodePanelInner
          node={node}
          onEdit={onEdit}
          onLike={onLike}
          can_edit={can_edit}
          can_like={can_like}
        />
      )}
    </div>
  );
});

export { NodePanel };
