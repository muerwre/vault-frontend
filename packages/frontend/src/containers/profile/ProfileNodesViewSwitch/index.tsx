import { FC } from 'react';

import { PROFILE_NODES_VIEW, ProfileNodesView } from '@vault/common/constants';
import { LayoutPanelLeftIcon, Rows3Icon } from 'lucide-react';

import { HorizontalMenu } from '~/components/menu/HorizontalMenu';

interface Props {
  value: ProfileNodesView;
  onChange: (view: ProfileNodesView) => void;
}

/**
 * Flow cells or lab cards for the profile's nodes. Only how they are drawn:
 * both views show the same listing.
 */
const ProfileNodesViewSwitch: FC<Props> = ({ value, onChange }) => (
  <HorizontalMenu>
    <HorizontalMenu.Item
      color="neutral"
      icon={<LayoutPanelLeftIcon size={20} />}
      active={value === PROFILE_NODES_VIEW.FLOW}
      onClick={() => onChange(PROFILE_NODES_VIEW.FLOW)}
    />

    <HorizontalMenu.Item
      color="neutral"
      icon={<Rows3Icon size={20} />}
      active={value === PROFILE_NODES_VIEW.LAB}
      onClick={() => onChange(PROFILE_NODES_VIEW.LAB)}
    />
  </HorizontalMenu>
);

export { ProfileNodesViewSwitch };
