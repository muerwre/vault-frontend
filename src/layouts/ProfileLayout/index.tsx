import { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { usePageCover } from '~/components/containers/PageCoverProvider/usePageCover';
import { FlowGrid } from '~/components/flow/FlowGrid';
import { Container } from '~/containers/main/Container';
import { ProfilePageLeft } from '~/containers/profile/ProfilePageLeft';
import { useUser } from '~/hooks/auth/useUser';
import { useGetProfile } from '~/hooks/profile/useGetProfile';
import { useFlowStore } from '~/store/flow/useFlowStore';

import styles from './styles.module.scss';

type Props = { username: string };

const ProfileLayout: FC<Props> = observer(({ username }) => {
  const { nodes } = useFlowStore();
  const { user } = useUser();
  const { profile, isLoading } = useGetProfile(username);

  usePageCover(user.cover);

  return (
    <Container className={styles.wrap}>
      <div className={styles.grid}>
        <div className={styles.stamp}>
          <div className={styles.row}>
            <ProfilePageLeft
              profile={profile}
              username={username}
              isLoading={isLoading}
            />
          </div>
        </div>

        <FlowGrid nodes={nodes} user={user} onChangeCellView={console.log} />
      </div>
    </Container>
  );
});

export { ProfileLayout };
