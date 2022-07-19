import React, { FC, useCallback, useState } from 'react';

import { Manager, Popper, Reference } from 'react-popper';

import { Avatar } from '~/components/common/Avatar';
import { MenuButton } from '~/components/menu';
import { ProfileQuickInfo } from '~/containers/profile/ProfileQuickInfo';
import { IUser } from '~/types/auth';
import { path } from '~/utils/ramda';

interface Props {
  user: IUser;
  className?: string;
}

const CommentAvatar: FC<Props> = ({ user, className }) => {
  return (
    <MenuButton
      position="top"
      icon={
        <Avatar url={path(['photo', 'url'], user)} username={user.username} className={className} />
      }
    >
      <ProfileQuickInfo user={user} />
    </MenuButton>
  );
};

export { CommentAvatar };
