import { FC, useCallback, useEffect, useState } from 'react';

import { PROFILE_NODES_VIEW, ProfileNodesView } from '@vault/common/constants';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';

import { Card } from '~/components/common/Card';
import { Columns } from '~/components/common/Columns';
import { Container } from '~/components/common/Container';
import { Filler } from '~/components/common/Filler';
import { Hoverable } from '~/components/common/Hoverable';
import { PageTitle } from '~/components/common/PageTitle';
import { SearchInput } from '~/components/input/SearchInput';
import { FlowGrid } from '~/containers/flow/FlowGrid';
import { LabNode } from '~/containers/lab/LabGrid/components/LabNode';
import { ProfileAboutCard } from '~/containers/profile/ProfileAboutCard';
import { ProfileLabCard } from '~/containers/profile/ProfileLabCard';
import { ProfileNodesViewSwitch } from '~/containers/profile/ProfileNodesViewSwitch';
import { ProfilePageLeft } from '~/containers/profile/ProfilePageLeft';
import { useUser } from '~/hooks/auth/useUser';
import { useInfiniteLoader } from '~/hooks/dom/useInfiniteLoader';
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

  // Only the owner switches, and their choice is saved: everyone sees the
  // profile as its owner set it. The pick shows at once, ahead of the save.
  const [pickedView, setPickedView] = useState<ProfileNodesView>();
  const view = pickedView ?? profile.nodes_view ?? PROFILE_NODES_VIEW.FLOW;
  const isLab = view === PROFILE_NODES_VIEW.LAB;

  useEffect(() => setPickedView(undefined), [username]);

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
  } = useUserNodes(username, !isLoading);

  useInfiniteLoader(loadMore, isLoadingNodes);

  const title = capitalize(profile.fullname || profile.username || username);
  usePageCover(profile.cover);

  if (notFound) {
    return <NotFoundLayout />;
  }

  return (
    <Container className={styles.wrap}>
      <PageTitle title={getPageTitle(title)} />

      <div
        className={classNames(styles.grid, {
          [styles.with_controls]: canEdit,
          [styles.lab_grid]: isLab,
        })}
      >
        {canEdit && (
          <Card className={styles.controls}>
            <ProfileNodesViewSwitch value={view} onChange={onChangeView} />
            <Filler />
            <div className={styles.search}>
              <SearchInput />
            </div>
          </Card>
        )}

        {!isLab && (
          <Card className={styles.left} seamless>
            <ProfilePageLeft
              profile={profile}
              username={username}
              isLoading={isLoading}
            />
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

        {isLab ? (
          <div className={styles.lab}>
            <Columns hasMore={hasMore && !isLoadingNodes}>
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
