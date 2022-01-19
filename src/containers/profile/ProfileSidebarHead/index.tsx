import React, { VFC } from 'react';

import { Filler } from '~/components/containers/Filler';
import { Group } from '~/components/containers/Group';
import { ProfileAvatar } from '~/components/profile/ProfileAvatar';
import { usePatchUser } from '~/hooks/auth/usePatchUser';
import { useUser } from '~/hooks/auth/useUser';

interface ProfileSidebarHeadProps {}

const ProfileSidebarHead: VFC<ProfileSidebarHeadProps> = () => {
  const { user } = useUser();
  const { updatePhoto } = usePatchUser();

  return (
    <Group horizontal>
      <ProfileAvatar canEdit onChangePhoto={updatePhoto} photo={user.photo} size={72} />

      <Filler>
        <h2>{user.fullname || user.username}</h2>
      </Filler>
    </Group>
  );
};

export { ProfileSidebarHead };
