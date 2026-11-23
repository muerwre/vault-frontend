import { FC, useCallback } from 'react';

import Tippy from '@tippyjs/react';
import classNames from 'classnames';
import {
  HeartIcon,
  MessageSquareDotIcon,
  MessageSquareIcon,
  PinIcon,
} from 'lucide-react';

import { Filler } from '~/components/common/Filler';
import { Grid } from '~/components/common/Grid';
import { Group } from '~/components/common/Group';
import { HeartFilledIcon } from '~/components/icons';
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
  isPinned?: boolean;
};

const LabBottomPanel: FC<Props> = ({
  node,
  hasNewComments,
  commentCount,
  isLoading,
  isPinned,
}) => {
  const { push } = useNavigation();
  const onClick = useCallback(
    () => push(URLS.NODE_URL(node.id)),
    [push, node.id],
  );

  return (
    <Group horizontal className={styles.wrap} onClick={onClick}>
      <div className={styles.timestamp}>
        <Placeholder active={isLoading}>
          {getPrettyDate(node.created_at)}
        </Placeholder>
      </div>

      <Filler />

      {isPinned && !isLoading && (
        <Tippy content="Закреплено наверху профиля">
          <span className={styles.pin}>
            <PinIcon size={20} fill="currentColor" />
          </span>
        </Tippy>
      )}

      <Placeholder active={isLoading} width="48px" height={24}>
        {commentCount > 0 && (
          <Grid
            horizontal
            className={classNames(styles.comments, {
              [styles.active]: hasNewComments,
            })}
          >
            {hasNewComments ? (
              <MessageSquareDotIcon size={24} />
            ) : (
              <MessageSquareIcon size={24} />
            )}
            <span>{commentCount}</span>
          </Grid>
        )}
      </Placeholder>

      <Placeholder active={isLoading} width="48px" height={24}>
        {!!node.like_count && node.like_count > 0 && (
          <Grid horizontal className={classNames(styles.like)}>
            {node.is_liked ? (
              <HeartFilledIcon size={24} />
            ) : (
              <HeartIcon size={24} />
            )}
            <span>{node.like_count}</span>
          </Grid>
        )}
      </Placeholder>
    </Group>
  );
};

export { LabBottomPanel };
