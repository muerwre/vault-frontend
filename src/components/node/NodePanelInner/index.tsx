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
}

const NodePanelInner: FC<IProps> = ({ node: { title, user }, stack }) => {
  return (
    <div className={classNames(styles.wrap, { stack })}>
      <div className={styles.content}>
        <Group horizontal className={styles.panel}>
          <Filler>
            <div className={styles.title}>{title || '...'}</div>
            {user && user.username && <div className={styles.name}>~ {user.username}</div>}
          </Filler>
        </Group>

        <div className={styles.buttons}>
          <Icon icon="edit" size={24} />

          <div className={styles.sep} />

          <Icon icon="heart" size={24} />
        </div>
      </div>
    </div>
  );
};

export { NodePanelInner };

// <div className={styles.mark} />
