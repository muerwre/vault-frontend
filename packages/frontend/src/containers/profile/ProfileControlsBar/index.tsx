import { FC } from 'react';

import { ProfileNodesView } from '@vault/common/constants';
import classNames from 'classnames';
import { SettingsIcon } from 'lucide-react';

import { Button } from '~/components/input/Button';
import { SearchInput } from '~/components/input/SearchInput';
import { ProfileNodesViewSwitch } from '~/containers/profile/ProfileNodesViewSwitch';

import styles from './styles.module.scss';

interface Props {
  view: ProfileNodesView;
  onChangeView: (view: ProfileNodesView) => void;
  /** Off while the profile is held to one view, such as a forced aura. */
  canSwitchView: boolean;
  onSettings: () => void;
  /** Without the pill's background and rounding, as over an aura. */
  plain?: boolean;
  /** Search, where there are posts on the page to search through. */
  search?: { value: string; onChange: (value: string) => void };
}

/**
 * The owner's controls for their profile, floating at the bottom of the
 * screen like the player, and above it while it shows. Pages with it leave
 * room at the bottom for it and the player.
 */
const ProfileControlsBar: FC<Props> = ({
  view,
  onChangeView,
  canSwitchView,
  onSettings,
  search,
}) => (
  <div className={classNames(styles.bar)}>
    {canSwitchView && (
      <div className={styles.desktop_only}>
        <ProfileNodesViewSwitch value={view} onChange={onChangeView} />
      </div>
    )}

    <Button
      type="button"
      color="primary"
      iconLeft={<SettingsIcon size={20} />}
      onClick={onSettings}
    >
      Настройки
    </Button>

    {!!search && (
      <div className={classNames(styles.search, styles.desktop_only)}>
        <SearchInput
          value={search.value}
          handler={search.onChange}
          placeholder="Поиск по постам"
        />
      </div>
    )}
  </div>
);

export { ProfileControlsBar };
