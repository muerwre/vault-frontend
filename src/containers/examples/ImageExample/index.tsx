import React, { FC } from 'react';
import { Card } from "~/components/containers/Card";
import * as styles from './styles.scss';
import { Group } from "~/components/containers/Group";
import { Padder } from "~/components/containers/Padder";
import range from 'ramda/es/range';
import { Comment } from "~/components/node/Comment";

interface IProps {}

const ImageExample: FC<IProps> = () => (
    <Card className={styles.node}>
      <Group>
        <div
          className={styles.image_container}
        >
          <img className={styles.image} src="http://37.192.131.144/full/photos/photo-20120702-99383.jpg" />
        </div>

        <Padder horizontal>
          <Group horizontal>
            <Group className={styles.comments}>
              {
                range(1,6).map(el => (
                  <Comment
                    key={el}
                  />
                ))
              }
            </Group>

            <div className={styles.panel}>

            </div>
          </Group>
        </Padder>
      </Group>
    </Card>
);

export { ImageExample };
