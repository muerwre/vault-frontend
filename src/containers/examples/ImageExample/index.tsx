import React, { FC } from 'react';
import { Card } from "~/components/containers/Card";
import * as styles from './styles.scss';
import { Group } from "~/components/containers/Group";
import { Padder } from "~/components/containers/Padder";
import range from 'ramda/es/range';
import { Comment } from "~/components/node/Comment";
import { NodePanel } from "~/components/node/NodePanel";
import { NodeRelated } from "~/components/node/NodeRelated";
import { Tags } from "~/components/node/Tags";
import { MenuButton } from "~/components/node/MenuButton";
import { NodeNoComments } from "~/components/node/NodeNoComments";

interface IProps {}

const ImageExample: FC<IProps> = () => (
    <Card className={styles.node} seamless>
      <div
        className={styles.image_container}
      >
        <img className={styles.image} src="http://37.192.131.144/full/attached/2017/11/f01fdaaea789915284757634baf7cd11.jpg" />
      </div>

      <NodePanel />

      <Group>
        <Padder>
          <Group horizontal className={styles.content}>
            <Group className={styles.comments}>
              <NodeNoComments />

              {
                range(1,6).map(el => (
                  <Comment
                    key={el}
                  />
                ))
              }
            </Group>

            <div className={styles.panel}>
              <Group style={{ flex: 1 }}>
                <Padder className={styles.buttons}>
                  <Group>
                    <MenuButton
                      title="На главной"
                      description="плывет по течению"
                      icon="star"
                    />

                    <MenuButton
                      title="Видно всем"
                      icon="star"
                    />

                    <MenuButton
                      title="Редактировать"
                      icon="star"
                    />
                  </Group>
                </Padder>

                <Tags
                  tags={[
                    { title: 'Избранный', feature: 'red' },
                    { title: 'Плейлист', feature: 'green' },
                    { title: 'Просто' },
                    { title: '+ фото', feature: 'black' },
                    { title: '+ с музыкой', feature: 'black' },
                  ]}
                />

                <NodeRelated
                  title="First album"
                />

                <NodeRelated
                  title="Second album"
                />
              </Group>
            </div>
          </Group>
        </Padder>
      </Group>
    </Card>
);

export { ImageExample };
