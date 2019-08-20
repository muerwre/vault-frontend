import React, { FC } from 'react';
import range from 'ramda/es/range';
import { Card } from '~/components/containers/Card';
import * as styles from './styles.scss';
import { Group } from '~/components/containers/Group';
import { Padder } from '~/components/containers/Padder';
import { Comment } from '~/components/node/Comment';
import { NodePanel } from '~/components/node/NodePanel';
import { NodeRelated } from '~/components/node/NodeRelated';
import { Tags } from '~/components/node/Tags';
import { NodeNoComments } from '~/components/node/NodeNoComments';
import { ImageSwitcher } from "~/components/node/ImageSwitcher";

interface IProps {}

const ImageExample: FC<IProps> = () => (
  <Card className={styles.node} seamless>
    <ImageSwitcher total={5} current={2} />

    <div className={styles.image_container}>
      <img
        className={styles.image}
        src="http://37.192.131.144/full/attached/2019/08/e4fb2a1d0a2e20d499aaa1f5f83a7115.jpg"
        alt=""
      />
    </div>

    <NodePanel />

    <Group>
      <Padder>
        <Group horizontal className={styles.content}>
          <Group className={styles.comments}>
            <NodeNoComments />

            {range(1, 6).map(el => (
              <Comment key={el} />
            ))}
          </Group>

          <div className={styles.panel}>
            <Group style={{ flex: 1 }}>
              <Tags
                tags={[
                  { title: 'Избранный', feature: 'red' },
                  { title: 'Плейлист', feature: 'green' },
                  { title: 'Просто' },
                  { title: '+ фото', feature: 'black' },
                  { title: '+ с музыкой', feature: 'black' },
                ]}
              />

              <NodeRelated title="First album" />

              <NodeRelated title="Second album" />
            </Group>
          </div>
        </Group>
      </Padder>
    </Group>
  </Card>
);

export { ImageExample };

/*
<Padder className={styles.buttons}>
  <Group>
    <MenuButton title="На главной" description="плывет по течению" icon="star" />

    <MenuButton title="Видно всем" icon="star" />

    <MenuButton title="Редактировать" icon="star" />
  </Group>
</Padder>
 */
