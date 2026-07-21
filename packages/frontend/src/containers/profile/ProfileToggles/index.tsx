import { FC } from 'react';

import { Group } from '~/components/common/Group';
import { SuperPowersToggle } from '~/containers/auth/SuperPowersToggle';

interface ProfileTogglesProps {}

const ProfileToggles: FC<ProfileTogglesProps> = () => (
  <Group>
    <SuperPowersToggle />
  </Group>
);

export { ProfileToggles };
