import React, { FC } from 'react';
import { Group } from '~/components/containers/Group';
import { Filler } from '~/components/containers/Filler';
import styles from './styles.module.scss';
import { getPrettyDate } from '~/utils/dom';
import { INode } from '~/redux/types';
import { Icon } from '~/components/input/Icon';
import classNames from 'classnames';
import { Grid } from '~/components/containers/Grid';

type Props = {
  node: INode;
  isLoading?: boolean;
  hasNewComments: boolean;
  commentCount: number;
};

const LabBottomPanel: FC<Props> = ({ node, hasNewComments, commentCount }) => (
  <Group horizontal className={styles.wrap}>
    <div className={styles.timestamp}>{getPrettyDate(node.created_at)}</div>
    <Filler />

    <Grid horizontal className={classNames(styles.comments)}>
      <Icon icon={node.is_liked ? 'heart_full' : 'heart'} />
      <span>{node.like_count}</span>
    </Grid>

    <Grid horizontal className={classNames(styles.comments, { [styles.active]: hasNewComments })}>
      <Icon icon={hasNewComments ? 'comment_new' : 'comment'} />
      <span>{commentCount}</span>
    </Grid>
  </Group>
);

export { LabBottomPanel };
