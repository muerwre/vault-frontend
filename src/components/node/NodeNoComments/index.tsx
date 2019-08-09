import React, { FC } from 'react';
import { Comment } from '~/components/node/Comment';
import * as styles from './styles.scss';
import { Group } from '~/components/containers/Group';

interface IProps {}

const NodeNoComments: FC<IProps> = () => (
  <Group className={styles.wrap}>
    <Comment is_empty is_loading={false} style={{ height: 94 }} />
    <Comment is_empty is_loading={false} style={{ height: 104 }} />
    <Comment is_empty is_loading={false} style={{ height: 100 }} />
  </Group>
);

export { NodeNoComments };
