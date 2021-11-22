import React, { FC, useCallback } from 'react';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { Group } from '~/components/containers/Group';
import { Icon } from '~/components/input/Icon';
import styles from './styles.module.scss';
import { INode } from '~/redux/types';
import { getPrettyDate } from '~/utils/dom';
import { URLS } from '~/constants/urls';
import { useHistory } from 'react-router-dom';

interface IProps {
  node?: Partial<INode>;
  isLoading?: boolean;
}

const LabHero: FC<IProps> = ({ node, isLoading }) => {
  const history = useHistory();
  const onClick = useCallback(() => {
    history.push(URLS.NODE_URL(node?.id));
  }, [history, node]);

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
        <div className={styles.description}>{getPrettyDate(node.created_at)}</div>
      </div>
    </Group>
  );
};

export { LabHero };
