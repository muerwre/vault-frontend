import React, { FC, useCallback } from 'react';

import { Group } from '~/components/common/Group';
import { Icon } from '~/components/common/Icon';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { URLS } from '~/constants/urls';
import { useNavigation } from '~/hooks/navigation/useNavigation';
import { INode } from '~/types';
import { getPrettyDate } from '~/utils/dom';

import styles from './styles.module.scss';

interface IProps {
  node?: Partial<INode>;
  isLoading?: boolean;
}

const LabHero: FC<IProps> = ({ node, isLoading }) => {
  const { push } = useNavigation();
  const onClick = useCallback(() => {
    push(URLS.NODE_URL(node?.id));
  }, [push, node]);

  if (!node || isLoading) {
    return (
      <Group horizontal className={styles.wrap1}>
        <div className={styles.star}>
          <Icon icon="star_full" size={32} />
        </div>

        <div className={styles.content}>
          <Placeholder height={20} />
          <Placeholder height={12} width="100px" />
        </div>
      </Group>
    );
  }

  return (
    <Group horizontal className={styles.wrap} onClick={onClick}>
      <div className={styles.star}>
        <Icon icon="star_full" size={32} />
      </div>

      <div className={styles.content}>
        <div className={styles.title}>{node.title}</div>
        <div className={styles.description}>
          {getPrettyDate(node.created_at)}
        </div>
      </div>
    </Group>
  );
};

export { LabHero };
