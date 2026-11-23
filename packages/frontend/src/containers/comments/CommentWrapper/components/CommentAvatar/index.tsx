import { FC } from 'react';

import { Avatar } from '~/components/common/Avatar';
import { ProfileLink } from '~/components/profile/ProfileLink';
import { IUser } from '~/types/auth';
import { path } from '~/utils/ramda';

interface Props {
  user?: IUser;
  className?: string;
}

/** Leads to the commenter's profile. */
const CommentAvatar: FC<Props> = ({ user, className }) => {
  if (!user) {
    return <Avatar className={className} />;
  }

  return (
    <ProfileLink username={user.username}>
      <Avatar
        url={path(['photo', 'url'], user)}
        username={user.username}
        className={className}
      />
    </ProfileLink>
  );
};

export { CommentAvatar };
