import { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { Card } from '~/components/common/Card';
import { Container } from '~/components/common/Container';
import { Filler } from '~/components/common/Filler';
import { SearchInput } from '~/components/input/SearchInput';
import { FlowGrid } from '~/containers/flow/FlowGrid';
import { ProfileAboutCard } from '~/containers/profile/ProfileAboutCard';
import { ProfilePageLeft } from '~/containers/profile/ProfilePageLeft';
import { useUser } from '~/hooks/auth/useUser';
import { useInfiniteLoader } from '~/hooks/dom/useInfiniteLoader';
import { useGetProfile } from '~/hooks/profile/useGetProfile';
import { useUserNodes } from '~/hooks/profile/useUserNodes';
import { NotFoundLayout } from '~/layouts/NotFoundLayout';
import { usePageCover } from '~/utils/providers/PageCoverProvider';

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
  const {
    nodes,
    loadMore,
    isLoading: isLoadingNodes,
    onChangeCellView,
  } = useUserNodes(username);

  const canEdit = !!user.id && user.id === profile.id;

  useInfiniteLoader(loadMore, isLoadingNodes);
  usePageCover(profile.cover);

  if (notFound) {
    return <NotFoundLayout />;
  }

  return (
    <Container className={styles.wrap}>
      {/* Placeholders: view controls, filters and search are not built yet. */}
      <Card className={styles.controls}>
        <div>View controls</div>
        <Filler />
        <div>Filters</div>
        <div>
          <SearchInput />
        </div>
      </Card>

      <div className={styles.grid}>
        <Card className={styles.left} seamless>
          <ProfilePageLeft
            profile={profile}
            username={username}
            isLoading={isLoading}
          />
        </Card>

        {SHOW_ABOUT_CARD && !isLoading && (
          <ProfileAboutCard
            className={styles.about}
            sizeClassNames={ABOUT_SIZES}
            about={profile.about || ''}
            display={profile.about_display || ''}
            placeholder={
              canEdit
                ? 'Расскажите о себе'
                : `~${profile.username} пока ничего не рассказал о себе`
            }
            canEdit={canEdit}
            onSaved={update}
          />
        )}

        <FlowGrid
          nodes={nodes}
          user={user}
          onChangeCellView={onChangeCellView}
        />
      </div>
    </Container>
  );
});

export { ProfileLayout };
