import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import * as styles from './styles.scss';
import { Group } from '~/components/containers/Group';
import { Filler } from '~/components/containers/Filler';
import { Icon } from '~/components/input/Icon';
import { INode } from '~/redux/types';
import classNames from 'classnames';

interface IProps {
  node: INode;
  stack?: boolean;

  can_edit: boolean;
  can_like: boolean;
  onEdit: () => void;
  onLike: () => void;
}

const NodePanelInner: FC<IProps> = ({
  node: { title, user },
  stack,
  can_edit,
  can_like,
  onEdit,
  onLike,
}) => {
  return (
    <div className={classNames(styles.wrap, { stack })}>
      <div className={styles.content}>
        <Group horizontal className={styles.panel}>
          <Filler>
            <div className={styles.title}>{title || '...'}</div>
            {user && user.username && <div className={styles.name}>~{user.username}</div>}
          </Filler>
        </Group>

        <div className={styles.buttons}>
          {can_edit && (
            <div>
              <Icon icon="edit" size={24} onClick={onEdit} />
            </div>
          )}
          {can_like && (
            <div>
              <Icon icon="heart" size={24} onClick={onLike} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { NodePanelInner };

// <div className={styles.mark} />
