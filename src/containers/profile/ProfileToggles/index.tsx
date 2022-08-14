import React, { FC } from 'react';

import { Group } from '~/components/containers/Group';
import { Zone } from '~/components/containers/Zone';
import { SuperPowersToggle } from '~/containers/auth/SuperPowersToggle';

interface ProfileTogglesProps {}

const ProfileToggles: FC<ProfileTogglesProps> = () => (
  <Group>
    <SuperPowersToggle />
  </Group>
);

export { ProfileToggles };
