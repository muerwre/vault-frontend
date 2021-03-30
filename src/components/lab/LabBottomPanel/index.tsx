import React, { FC, useCallback } from 'react';
import { Group } from '~/components/containers/Group';
import { Filler } from '~/components/containers/Filler';
import styles from './styles.module.scss';
import { getPrettyDate } from '~/utils/dom';
import { INode } from '~/redux/types';
import { Icon } from '~/components/input/Icon';
import classNames from 'classnames';
import { Grid } from '~/components/containers/Grid';
import { useHistory } from 'react-router';
import { URLS } from '~/constants/urls';

type Props = {
  node: INode;
  isLoading?: boolean;
  hasNewComments: boolean;
  commentCount: number;
};

const LabBottomPanel: FC<Props> = ({ node, hasNewComments, commentCount }) => {
  const history = useHistory();
  const onClick = useCallback(() => history.push(URLS.NODE_URL(node.id)), [node.id]);

  return (
    <Group horizontal className={styles.wrap} onClick={onClick}>
      <div className={styles.timestamp}>{getPrettyDate(node.created_at)}</div>
      <Filler />

      {commentCount > 0 && (
        <Grid
          horizontal
          className={classNames(styles.comments, { [styles.active]: hasNewComments })}
        >
          <Icon icon={hasNewComments ? 'comment_new' : 'comment'} size={24} />
          <span>{commentCount}</span>
        </Grid>
      )}

      {!!node.like_count && node.like_count > 0 && (
        <Grid horizontal className={classNames(styles.like)}>
          <Icon icon={node.is_liked ? 'heart_full' : 'heart'} size={24} />
          <span>{node.like_count}</span>
        </Grid>
      )}
    </Group>
  );
};

export { LabBottomPanel };
