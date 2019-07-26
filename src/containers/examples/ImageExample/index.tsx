import React, { FC } from 'react';
import { Card } from "~/components/containers/Card";
import * as styles from './styles.scss';
import { Group } from "~/components/containers/Group";
import { Padder } from "~/components/containers/Padder";
import range from 'ramda/es/range';
import { Comment } from "~/components/node/Comment";

interface IProps {}

const ImageExample: FC<IProps> = () => (
    <Card>
      <Group>
        <div className={styles.image_container} />

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
