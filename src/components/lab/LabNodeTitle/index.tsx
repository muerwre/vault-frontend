import React, { FC } from 'react';
import { INode } from '~/redux/types';
import styles from './styles.module.scss';
import { Group } from '~/components/containers/Group';
import { Icon } from '~/components/input/Icon';
import Tippy from '@tippy.js/react';
import { useGotoNode } from '~/utils/hooks/node/useGotoNode';

interface IProps {
  node: INode;
}

const LabNodeTitle: FC<IProps> = ({ node }) => {
  const onClick = useGotoNode(node.id);

  if (!node.title) return null;

  return (
    <Group horizontal className={styles.wrap} onClick={onClick}>
      <div className={styles.title}>{node.title || '...'}</div>

      {node.is_heroic && (
        <Tippy content="Важный пост">
          <div className={styles.star}>
            <Icon icon="star_full" size={24} />
          </div>
        </Tippy>
      )}
    </Group>
  );
};

export { LabNodeTitle };
