import React, { FC } from 'react';
import { INode } from '~/redux/types';
import styles from './styles.module.scss';
import { URLS } from '~/constants/urls';
import { Link } from 'react-router-dom';
import { Group } from '~/components/containers/Group';
import { Icon } from '~/components/input/Icon';
import Tippy from '@tippy.js/react';

interface IProps {
  node: INode;
}

const LabNodeTitle: FC<IProps> = ({ node }) => {
  if (!node.title) return null;

  return (
    <Group horizontal className={styles.wrap}>
      <div className={styles.title}>
        <Link to={URLS.NODE_URL(node.id)}>{node.title || '...'}</Link>
      </div>

      {node.is_heroic && (
        <Tippy content="Важный пост">
          <div className={styles.star}>
            <Icon icon="star_full" />
          </div>
        </Tippy>
      )}
    </Group>
  );
};

export { LabNodeTitle };
