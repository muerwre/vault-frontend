import { FC } from 'react';

import { PROFILE_NODES_VIEW, ProfileNodesView } from '@vault/common/constants';
import {
  LayoutPanelLeftIcon,
  Rows3Icon,
  SquareSparklesIcon,
} from 'lucide-react';

import { HorizontalMenu } from '~/components/menu/HorizontalMenu';

interface Props {
  value: ProfileNodesView;
  onChange: (view: ProfileNodesView) => void;
}

/**
 * Flow cells or lab cards for the profile's nodes, or the aura: the profile
 * alone. The first two only change how the same listing is drawn.
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

    <HorizontalMenu.Item
      color="neutral"
      icon={<SquareSparklesIcon size={20} />}
      active={value === PROFILE_NODES_VIEW.AURA}
      onClick={() => onChange(PROFILE_NODES_VIEW.AURA)}
    />
  </HorizontalMenu>
);

export { ProfileNodesViewSwitch };
