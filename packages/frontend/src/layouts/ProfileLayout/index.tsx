import { FC, useCallback, useEffect, useState } from 'react';

import { PROFILE_NODES_VIEW, ProfileNodesView } from '@vault/common/constants';
import classNames from 'classnames';
import { SettingsIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';

import { Card } from '~/components/common/Card';
import { Columns } from '~/components/common/Columns';
import { Container } from '~/components/common/Container';
import { Filler } from '~/components/common/Filler';
import { Hoverable } from '~/components/common/Hoverable';
import { PageTitle } from '~/components/common/PageTitle';
import { Button } from '~/components/input/Button';
import { SearchInput } from '~/components/input/SearchInput';
import { URLS } from '~/constants/urls';
import { FlowGrid } from '~/containers/flow/FlowGrid';
import { LabNode } from '~/containers/lab/LabGrid/components/LabNode';
import { ProfileAboutCard } from '~/containers/profile/ProfileAboutCard';
import { ProfileLabCard } from '~/containers/profile/ProfileLabCard';
import { ProfileNodesViewSwitch } from '~/containers/profile/ProfileNodesViewSwitch';
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
  const view = pickedView ?? profile.nodes_view ?? PROFILE_NODES_VIEW.FLOW;
  const isLab = view === PROFILE_NODES_VIEW.LAB;

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
      if (!canEdit || next === view) return;

      setPickedView(next);

      const errors = await saveProfile({ nodes_view: next });

      if (errors) {
        setPickedView(undefined);
      }
    },
    [canEdit, view, saveProfile],
  );

  // the same listing for both views; the switch only picks how it is drawn
  const {
    items,
    nodes,
    hasMore,
    loadMore,
    isLoading: isLoadingNodes,
    onChangeCellView,
    onResetCellView,
  } = useUserNodes(username, !isLoading, searchDebounced);

  const isNothingFound =
    !!searchDebounced && !isLoadingNodes && items.length === 0;

  useInfiniteLoader(loadMore, isLoadingNodes);

  // As many grid rows as the profile beside the cells needs, so a long one
  // neither stretches the controls' row nor gets cut off.
  const [grid, setGrid] = useState<HTMLDivElement | null>(null);
  const [controls, setControls] = useState<HTMLDivElement | null>(null);
  const [sidebar, setSidebar] = useState<HTMLDivElement | null>(null);
  const [sidebarContent, setSidebarContent] = useState<HTMLDivElement | null>(
    null,
  );
  const sidebarSpan = useGridRowSpan(
    { grid, content: sidebarContent, header: controls, item: sidebar },
    canEdit ? 3 : 2,
  );

  const title = capitalize(profile.fullname || profile.username || username);
  usePageCover(profile.cover);

  if (notFound) {
    return <NotFoundLayout />;
  }

  return (
    <Container className={styles.wrap}>
      <PageTitle title={getPageTitle(title)} />

      <div
        ref={setGrid}
        className={classNames(styles.grid, {
          [styles.with_controls]: canEdit,
          [styles.lab_grid]: isLab,
        })}
      >
        {canEdit && (
          <div ref={setControls} className={styles.controls}>
            <ProfileNodesViewSwitch value={view} onChange={onChangeView} />

            <Button
              type="button"
              color="primary"
              iconLeft={<SettingsIcon size={20} />}
              onClick={() => push(URLS.SETTINGS.BASE)}
            >
              Настройки
            </Button>

            <Filler />

            <div className={styles.search}>
              <SearchInput
                value={search}
                handler={setSearch}
                placeholder="Поиск по постам"
              />
            </div>
          </div>
        )}

        {!isLab && (
          <Card
            ref={setSidebar}
            className={styles.left}
            style={{ gridRowEnd: `span ${sidebarSpan}` }}
            seamless
          >
            <div ref={setSidebarContent}>
              <ProfilePageLeft
                profile={profile}
                username={username}
                isLoading={isLoading}
              />
            </div>
          </Card>
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
