import React, { FC, useCallback, useState } from 'react';

import { Manager, Popper, Reference } from 'react-popper';

import { Avatar } from '~/components/common/Avatar';
import { useRandomPhrase } from '~/constants/phrases';
import { IUser } from '~/types/auth';
import { path } from '~/utils/ramda';

import styles from './styles.module.scss';

interface Props {
  user: IUser;
  withDetails: boolean;
  className?: string;
}

const modifiers = [
  {
    name: 'offset',
    options: {
      offset: [0, 10],
    },
  },
];

const CommentAvatar: FC<Props> = ({ user, withDetails, className }) => {
  const [hovered, setHovered] = useState(false);
  const randomPhrase = useRandomPhrase('USER_DESCRIPTION');

  const onMouseOver = useCallback(() => setHovered(true), [setHovered]);
  const onMouseOut = useCallback(() => setHovered(false), [setHovered]);

  return (
    <Manager>
      <Reference>
        {({ ref }) => (
          <Avatar
            url={path(['photo', 'url'], user)}
            username={user.username}
            className={className}
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
            ref={ref}
          />
        )}
      </Reference>

      {hovered && withDetails && (
        <Popper placement="right" modifiers={modifiers} strategy="fixed">
          {({ style, ref }) => (
            <div style={style} ref={ref} className={styles.popper}>
              <h4 className={styles.username}>{user.fullname || user.username}</h4>
              <div className={styles.description}>{user.description || randomPhrase}</div>
            </div>
          )}
        </Popper>
      )}
    </Manager>
  );
};

export { CommentAvatar };
