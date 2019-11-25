import React, { FC, useCallback, useEffect, useRef, useState, memo } from 'react';
import * as styles from './styles.scss';
import { INode } from '~/redux/types';
import { createPortal } from 'react-dom';
import { NodePanelInner } from '~/components/node/NodePanelInner';
import pick from 'ramda/es/pick';

interface IProps {
  node: Partial<INode>;
  layout: {};

  can_edit: boolean;
  can_like: boolean;
  can_star: boolean;

  is_loading?: boolean;

  onEdit: () => void;
  onLike: () => void;
  onStar: () => void;
}

const NodePanel: FC<IProps> = memo(
  ({ node, layout, can_edit, can_like, can_star, is_loading, onEdit, onLike, onStar }) => {
    const [stack, setStack] = useState(false);

    const ref = useRef(null);
    const getPlace = useCallback(() => {
      if (!ref.current) return;

      const { bottom } = ref.current.getBoundingClientRect();

      setStack(bottom > window.innerHeight);
    }, [ref]);

    useEffect(() => getPlace(), [layout]);

    useEffect(() => {
      window.addEventListener('scroll', getPlace);
      window.addEventListener('resize', getPlace);

      return () => {
        window.removeEventListener('scroll', getPlace);
        window.removeEventListener('resize', getPlace);
      };
    }, [layout, getPlace]);

    return (
      <div className={styles.place} ref={ref}>
        {stack ? (
          createPortal(
            <NodePanelInner
              node={node}
              stack
              onEdit={onEdit}
              onLike={onLike}
              onStar={onStar}
              can_edit={can_edit}
              can_like={can_like}
              can_star={can_star}
              is_loading={is_loading}
            />,
            document.body
          )
        ) : (
          <NodePanelInner
            node={node}
            onEdit={onEdit}
            onLike={onLike}
            onStar={onStar}
            can_edit={can_edit}
            can_like={can_like}
            can_star={can_star}
            is_loading={is_loading}
          />
        )}
      </div>
    );
  }
);

export { NodePanel };
