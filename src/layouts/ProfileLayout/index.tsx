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
        {
          <Card className={styles.description}>
            <p>
              Inceptos cubilia velit faucibus mattis enim, massa conubia primis
              torquent orci etiam? Pharetra arcu maecenas eget aptent auctor
              massa habitant metus faucibus enim rhoncus. Laoreet fusce odio
              litora primis senectus leo risus tristique semper augue tempor
              arcu. Gravida sed cubilia malesuada hac proin parturient cubilia
              habitant vulputate erat laoreet egestas. Condimentum.
            </p>
            <p>
              Porta dui non eget varius pretium blandit fusce luctus sem
              fermentum ac. At, porta iaculis primis! Mus aenean quam himenaeos
              est vel interdum nostra sociosqu sodales sodales. Senectus
              penatibus erat penatibus orci a suspendisse purus tristique
              habitant rutrum ornare maecenas. Sapien vestibulum est ad
              ridiculus viverra curae; suscipit penatibus lectus. A parturient
              viverra morbi. Elit class primis laoreet, fusce integer pulvinar
              facilisi. Dapibus scelerisque, leo mattis non primis dis. Sapien
              lobortis mauris platea porttitor per class natoque maecenas fusce!
              Est tellus sed leo!
            </p>
            <p>
              Eros enim ac posuere vel mollis duis vivamus vivamus in est.
              Elementum nostra himenaeos donec augue fermentum nascetur faucibus
              dui lobortis. Hac per conubia a nunc primis. Tempus tempus erat
              quam platea viverra nibh laoreet at aenean. Convallis habitasse,
              luctus libero dis natoque suspendisse commodo hac? Natoque velit
              pulvinar fusce posuere aliquam amet non. Dui phasellus netus
              luctus. Potenti nostra tristique maecenas quisque egestas sociis!
              A a sociosqu molestie sed blandit sapien sed pellentesque. Nisi
              purus auctor aliquam tortor auctor faucibus. Quisque, ullamcorper
              nisi tellus dignissim tempus.
            </p>
            <p>
              Orci dis tincidunt porttitor amet ad hendrerit proin sollicitudin
              mi. Amet sodales mi vivamus lacus sociosqu eleifend eros blandit
              quisque mus dignissim imperdiet? Viverra suscipit metus eleifend
              cras nibh nisl, fusce cum nascetur nibh. Sagittis cubilia
              vulputate mauris lobortis! Rhoncus, ultrices magna ut condimentum.
              Accumsan consequat penatibus vehicula varius nulla magna arcu leo
              primis. Lacus pretium facilisis luctus quis sodales torquent
              tempor? Nam scelerisque hendrerit diam ante cubilia volutpat. Nisi
              curae; accumsan phasellus cursus orci tempus dolor ridiculus?
              Taciti dis scelerisque sit.
            </p>
            <p>
              Ligula odio aliquam donec platea? Ut; urna per praesent erat
              conubia fermentum. Dis dapibus vulputate quisque odio cum et
              vivamus ut. Risus accumsan cubilia ante nisi cum. Vulputate tempor
              platea eget eleifend auctor rhoncus, vivamus vel ut? Nunc turpis
              inceptos molestie molestie. Class libero eros volutpat placerat
              quisque. Inceptos litora, felis.
            </p>
          </Card>
        }

        <Card className={styles.left} seamless>
          <Sticky>
            <ProfilePageLeft
              description={profile.description}
              profile={profile}
              username={username}
              isLoading={isLoading}
            />
          </Sticky>
        </Card>

        <FlowGrid nodes={nodes} user={user} onChangeCellView={() => {}} />
        <FlowGrid nodes={nodes} user={user} onChangeCellView={() => {}} />
      </div>
    </Container>
  );
});

export { ProfileLayout };
