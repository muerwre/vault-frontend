import { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { Card } from '~/components/common/Card';
import { Container } from '~/components/common/Container';
import { Sticky } from '~/components/common/Sticky';
import { FlowGrid } from '~/containers/flow/FlowGrid';
import { ProfilePageLeft } from '~/containers/profile/ProfilePageLeft';
import { useUser } from '~/hooks/auth/useUser';
import { useGetProfile } from '~/hooks/profile/useGetProfile';
import { useFlowStore } from '~/store/flow/useFlowStore';
import { usePageCover } from '~/utils/providers/PageCoverProvider';

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
          <Sticky>
            <ProfilePageLeft
              description={profile.description}
              profile={profile}
              username={username}
              isLoading={isLoading}
            />
          </Sticky>
        </div>

        <Card className={styles.description}>{profile.description}</Card>

        <div className={styles.nodes}>
          <FlowGrid nodes={nodes} user={user} onChangeCellView={() => {}} />
        </div>
      </div>
    </Container>
  );
});

export { ProfileLayout };
