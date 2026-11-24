import { FC, useCallback, useEffect, useState } from 'react';

import { PROFILE_NODES_VIEW, ProfileNodesView } from '@vault/common/constants';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';

import { Columns } from '~/components/common/Columns';
import { Container } from '~/components/common/Container';
import { Hoverable } from '~/components/common/Hoverable';
import { PageTitle } from '~/components/common/PageTitle';
import { URLS } from '~/constants/urls';
import { FlowGrid } from '~/containers/flow/FlowGrid';
import { LabNode } from '~/containers/lab/LabGrid/components/LabNode';
import { ProfileAboutCard } from '~/containers/profile/ProfileAboutCard';
import { ProfileAura } from '~/containers/profile/ProfileAura';
import { ProfileControlsBar } from '~/containers/profile/ProfileControlsBar';
import { ProfileLabCard } from '~/containers/profile/ProfileLabCard';
import { ProfilePageLeft } from '~/containers/profile/ProfilePageLeft';
import { useUser } from '~/hooks/auth/useUser';
import { useDebouncedValue } from '~/hooks/data/useDebouncedValue';
import { useGridRowSpan } from '~/hooks/dom/useGridRowSpan';
import { useInfiniteLoader } from '~/hooks/dom/useInfiniteLoader';
import { useNavigation } from '~/hooks/navigation/useNavigation';
import { useGetProfile } from '~/hooks/profile/useGetProfile';
import { useSaveProfile } from '~/hooks/profile/useSaveProfile';
import { useUserNodes } from '~/hooks/profile/useUserNodes';
import { NotFoundLayout } from '~/layouts/NotFoundLayout';
import { usePageCover } from '~/utils/providers/PageCoverProvider';
import { getPageTitle } from '~/utils/ssr/getPageTitle';
import { formatUsername } from '~/utils/user';

/** First letter up, as names are shown in the page title. */
const capitalize = (value: string) =>
  value ? value[0].toLocaleUpperCase() + value.slice(1) : value;

import styles from './styles.module.scss';

/** Fewer posts than this and the profile is always shown as an aura. */
const MIN_POSTS = 3;

const noop = () => {};

/** Lab cards by window width: three on wide screens, as the page is wide. */
const LAB_COLUMNS = { default: 3, 1200: 2, 840: 1 };

/** The about card is hidden until its design settles; pinned posts lead instead. */
const SHOW_ABOUT_CARD = false;

const ABOUT_SIZES = {
  single: styles.single,
  horizontal: styles.horizontal,
  vertical: styles.vertical,
  quadro: styles.quadro,
};

type Props = { username: string };

const ProfileLayout: FC<Props> = observer(({ username }) => {
  const { user } = useUser();
  const { profile, isLoading, notFound, update } = useGetProfile(username);
  const canEdit = !!user.id && user.id === profile.id;
  const { push } = useNavigation();

  // Only the owner switches, and their choice is saved: everyone sees the
  // profile as its owner set it. The pick shows at once, ahead of the save.
  const [pickedView, setPickedView] = useState<ProfileNodesView>();
  const savedView = pickedView ?? profile.nodes_view ?? PROFILE_NODES_VIEW.FLOW;

  const [search, setSearch] = useState('');
  const searchDebounced = useDebouncedValue(search.trim());

  useEffect(() => {
    setPickedView(undefined);
    setSearch('');
  }, [username]);

  const { submit: saveProfile } = useSaveProfile(update);

  // Compared with what is shown, not what is stored: the stored view only
  // updates once a save returns, so a quick switch back would go unsaved. A
  // failed save drops the pick, back to the stored view.
  const onChangeView = useCallback(
    async (next: ProfileNodesView) => {
      if (!canEdit || next === savedView) return;

      setPickedView(next);

      const errors = await saveProfile({ nodes_view: next });

      if (errors) {
        setPickedView(undefined);
      }
    },
    [canEdit, savedView, saveProfile],
  );

  // the same listing for both views; the switch only picks how it is drawn
  const {
    items,
    nodes,
    isLoaded,
    hasMore,
    loadMore,
    isLoading: isLoadingNodes,
    onChangeCellView,
    onResetCellView,
  } = useUserNodes(username, !isLoading, searchDebounced);

  // A profile with fewer than three posts is always an aura. Judged on the
  // whole listing only, not on what a search leaves.
  const isAuraForced =
    !searchDebounced && isLoaded && !hasMore && items.length < MIN_POSTS;
  const view = isAuraForced ? PROFILE_NODES_VIEW.AURA : savedView;
  const isLab = view === PROFILE_NODES_VIEW.LAB;
  const isAura = view === PROFILE_NODES_VIEW.AURA;

  const isNothingFound =
    !!searchDebounced && !isLoadingNodes && items.length === 0;

  useInfiniteLoader(isAura ? noop : loadMore, isLoadingNodes);

  // As many grid rows as the profile beside the cells needs, so a long one
  // is not cut off.
  const [grid, setGrid] = useState<HTMLDivElement | null>(null);
  const [sidebarContent, setSidebarContent] = useState<HTMLDivElement | null>(
    null,
  );
  const sidebarSpan = useGridRowSpan({ grid, content: sidebarContent }, 2);

  const title = capitalize(profile.fullname || profile.username || username);
  usePageCover(profile.cover);

  if (notFound) {
    return <NotFoundLayout />;
  }

  const controlsBar = canEdit && (
    <ProfileControlsBar
      view={view}
      onChangeView={onChangeView}
      canSwitchView={!isAuraForced}
      onSettings={() => push(URLS.SETTINGS.BASE)}
      plain={isAura}
      search={isAura ? undefined : { value: search, onChange: setSearch }}
    />
  );

  if (isAura) {
    return (
      <Container
        className={classNames(styles.wrap, styles.aura_page, {
          [styles.with_controls]: canEdit,
        })}
      >
        <PageTitle title={getPageTitle(title)} />

        <ProfileAura
          profile={profile}
          username={username}
          isLoading={isLoading}
        />

        {controlsBar}
      </Container>
    );
  }

  return (
    <Container
      className={classNames(styles.wrap, { [styles.with_controls]: canEdit })}
    >
      <PageTitle title={getPageTitle(title)} />

      {controlsBar}

      <div
        ref={setGrid}
        className={classNames(styles.grid, { [styles.lab_grid]: isLab })}
      >
        {!isLab && (
          <div
            className={styles.left}
            style={{ gridRowEnd: `span ${sidebarSpan}` }}
          >
            <div ref={setSidebarContent}>
              <ProfilePageLeft
                profile={profile}
                username={username}
                isLoading={isLoading}
              />
            </div>
          </div>
        )}

        {SHOW_ABOUT_CARD && !isLoading && (
          <ProfileAboutCard
            className={styles.about}
            sizeClassNames={ABOUT_SIZES}
            about={profile.about || ''}
            display={profile.about_display || ''}
            placeholder={
              canEdit
                ? 'Расскажите о себе'
                : `${formatUsername(profile.username)} пока ничего не рассказал о себе`
            }
            canEdit={canEdit}
            onSaved={update}
          />
        )}

        {isNothingFound && (
          <div className={styles.nothing_found}>
            Ничего не нашлось по запросу «{searchDebounced}»
          </div>
        )}

        {isLab ? (
          <div className={styles.lab}>
            <Columns cols={LAB_COLUMNS} hasMore={hasMore && !isLoadingNodes}>
              <ProfileLabCard
                profile={profile}
                username={username}
                isLoading={isLoading}
              />

              {items.map((item) => (
                <Hoverable key={item.node.id} effect="shine">
                  <LabNode
                    node={item.node}
                    lastSeen={item.last_seen}
                    commentCount={item.comment_count}
                    showPin
                  />
                </Hoverable>
              ))}
            </Columns>
          </div>
        ) : (
          <FlowGrid
            nodes={nodes}
            user={user}
            onChangeCellView={onChangeCellView}
            onResetCellView={onResetCellView}
            showPins
          />
        )}
      </div>
    </Container>
  );
});

export { ProfileLayout };
