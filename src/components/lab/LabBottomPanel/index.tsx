import React, { FC, useCallback } from 'react';

import classNames from 'classnames';

import { Filler } from '~/components/containers/Filler';
import { Grid } from '~/components/containers/Grid';
import { Group } from '~/components/containers/Group';
import { Icon } from '~/components/input/Icon';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { URLS } from '~/constants/urls';
import { useNavigation } from '~/hooks/navigation/useNavigation';
import { INode } from '~/types';
import { getPrettyDate } from '~/utils/dom';

import styles from './styles.module.scss';

type Props = {
  node: INode;
  isLoading?: boolean;
  hasNewComments: boolean;
  commentCount: number;
};

const LabBottomPanel: FC<Props> = ({ node, hasNewComments, commentCount, isLoading }) => {
  const { push } = useNavigation();
  const onClick = useCallback(() => push(URLS.NODE_URL(node.id)), [push, node.id]);

  return (
    <Group horizontal className={styles.wrap} onClick={onClick}>
      <div className={styles.timestamp}>
        <Placeholder active={isLoading}>{getPrettyDate(node.created_at)}</Placeholder>
      </div>

      <Filler />

      <Placeholder active={isLoading} width="48px" height={24}>
        {commentCount > 0 && (
          <Grid
            horizontal
            className={classNames(styles.comments, { [styles.active]: hasNewComments })}
          >
            <Icon icon={hasNewComments ? 'comment_new' : 'comment'} size={24} />
            <span>{commentCount}</span>
          </Grid>
        )}
      </Placeholder>

      <Placeholder active={isLoading} width="48px" height={24}>
        {!!node.like_count && node.like_count > 0 && (
          <Grid horizontal className={classNames(styles.like)}>
            <Icon icon={node.is_liked ? 'heart_full' : 'heart'} size={24} />
            <span>{node.like_count}</span>
          </Grid>
        )}
      </Placeholder>
    </Group>
  );
};

export { LabBottomPanel };
