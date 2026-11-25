import { FC } from 'react';

import Tippy from '@tippyjs/react';

import { Group } from '~/components/common/Group';
import { StarFilledIcon } from '~/components/icons';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { useGotoNode } from '~/hooks/node/useGotoNode';

import { LabBlockProps } from '../../constants';

import styles from './styles.module.scss';

const LabNodeTitle: FC<LabBlockProps> = ({ node, isLoading, titleIcon }) => {
  const onClick = useGotoNode(node.id);

  if (!node.title) return null;

  const hasCustomIcon = titleIcon !== undefined;

  return (
    <Group horizontal className={styles.wrap} onClick={onClick}>
      <div className={styles.title}>
        <Placeholder active={isLoading}>{node.title || '...'}</Placeholder>
      </div>

      {!hasCustomIcon && (node.is_heroic || isLoading) && (
        <Placeholder active={isLoading} width="24px" height={24}>
          <Tippy content="Важный пост">
            <div className={styles.icon}>
              <StarFilledIcon size={24} />
            </div>
          </Tippy>
        </Placeholder>
      )}

      {hasCustomIcon && !isLoading && !!titleIcon && (
        <div className={styles.icon}>{titleIcon}</div>
      )}
    </Group>
  );
};

export { LabNodeTitle };
