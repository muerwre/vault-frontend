import React, { FC } from 'react';
import styles from './styles.module.scss';
import { Group } from '~/components/containers/Group';
import { Icon } from '~/components/input/Icon';
import Tippy from '@tippy.js/react';
import { useGotoNode } from '~/hooks/node/useGotoNode';
import { INodeComponentProps } from '~/redux/node/constants';
import { Placeholder } from '~/components/placeholders/Placeholder';

const LabNodeTitle: FC<INodeComponentProps> = ({ node, isLoading }) => {
  const onClick = useGotoNode(node.id);

  if (!node.title) return null;

  return (
    <Group horizontal className={styles.wrap} onClick={onClick}>
      <div className={styles.title}>
        <Placeholder active={isLoading}>{node.title || '...'}</Placeholder>
      </div>

      {(node.is_heroic || isLoading) && (
        <Placeholder active={isLoading} width="24px" height={24}>
          <Tippy content="Важный пост">
            <div className={styles.star}>
              <Icon icon="star_full" size={24} />
            </div>
          </Tippy>
        </Placeholder>
      )}
    </Group>
  );
};

export { LabNodeTitle };
