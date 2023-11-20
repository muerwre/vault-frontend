import { FC } from 'react';

import { Avatar } from '~/components/common/Avatar';
import { MenuButton } from '~/components/menu/MenuButton';
import { ProfileQuickInfo } from '~/containers/profile/ProfileQuickInfo';
import { IUser } from '~/types/auth';
import { path } from '~/utils/ramda';

interface Props {
  user?: IUser;
  className?: string;
}

const CommentAvatar: FC<Props> = ({ user, className }) => {
  if (!user) {
    return <Avatar className={className} />;
  }

  return (
    <MenuButton
      position="auto"
      icon={
        <Avatar
          url={path(['photo', 'url'], user)}
          username={user.username}
          className={className}
        />
      }
    >
      <ProfileQuickInfo user={user} />
    </MenuButton>
  );
};

export { CommentAvatar };
