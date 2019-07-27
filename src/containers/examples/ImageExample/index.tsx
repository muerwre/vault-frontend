import React, { FC } from 'react';
import { Card } from "~/components/containers/Card";
import * as styles from './styles.scss';
import { Group } from "~/components/containers/Group";
import { Padder } from "~/components/containers/Padder";
import range from 'ramda/es/range';
import { Comment } from "~/components/node/Comment";
import { NodePanel } from "~/components/node/NodePanel";
import { Filler } from "~/components/containers/Filler";
import { Tag } from "~/components/node/Tag";
import { TagField } from "~/components/containers/TagField";
import {NodeRelated} from "~/components/node/NodeRelated";

interface IProps {}

const ImageExample: FC<IProps> = () => (
    <Card className={styles.node}>
      <div
        className={styles.image_container}
      >
        {
          // http://37.192.131.144/full/attached/2017/11/f01fdaaea789915284757634baf7cd11.jpg
          // http://37.192.131.144/full/photos/photo-20120702-99383.jpg
        }
        <img className={styles.image} src="http://37.192.131.144/full/attached/2017/11/f01fdaaea789915284757634baf7cd11.jpg" />
      </div>

      <NodePanel />

      <Group>
        <Padder>
          <Group horizontal className={styles.content}>
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
              <Group style={{ flex: 1 }}>
                <Padder className={styles.buttons}>
                  <Group>
                    <div className={styles.button}>
                      <Group horizontal>
                        <div className={styles.button_icon}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/></svg>
                        </div>

                        <Filler>
                          <div className={styles.button_title}>На главной</div>
                        </Filler>
                      </Group>
                    </div>

                    <div className={styles.button}>
                      <Group horizontal>
                        <div className={styles.button_icon}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0zm0 0h24v24H0V0zm0 0h24v24H0V0zm0 0h24v24H0V0z"/><path d="M12 6c3.79 0 7.17 2.13 8.82 5.5-.59 1.22-1.42 2.27-2.41 3.12l1.41 1.41c1.39-1.23 2.49-2.77 3.18-4.53C21.27 7.11 17 4 12 4c-1.27 0-2.49.2-3.64.57l1.65 1.65C10.66 6.09 11.32 6 12 6zm-1.07 1.14L13 9.21c.57.25 1.03.71 1.28 1.28l2.07 2.07c.08-.34.14-.7.14-1.07C16.5 9.01 14.48 7 12 7c-.37 0-.72.05-1.07.14zM2.01 3.87l2.68 2.68C3.06 7.83 1.77 9.53 1 11.5 2.73 15.89 7 19 12 19c1.52 0 2.98-.29 4.32-.82l3.42 3.42 1.41-1.41L3.42 2.45 2.01 3.87zm7.5 7.5l2.61 2.61c-.04.01-.08.02-.12.02-1.38 0-2.5-1.12-2.5-2.5 0-.05.01-.08.01-.13zm-3.4-3.4l1.75 1.75c-.23.55-.36 1.15-.36 1.78 0 2.48 2.02 4.5 4.5 4.5.63 0 1.23-.13 1.77-.36l.98.98c-.88.24-1.8.38-2.75.38-3.79 0-7.17-2.13-8.82-5.5.7-1.43 1.72-2.61 2.93-3.53z"/></svg>
                        </div>

                        <Filler>
                          <div className={styles.button_title}>Видно всем</div>
                        </Filler>
                      </Group>
                    </div>

                    <div className={styles.button}>
                      <Group horizontal>
                        <div className={styles.button_icon}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0zm0 0h24v24H0V0zm0 0h24v24H0V0zm0 0h24v24H0V0z"/><path d="M12 6c3.79 0 7.17 2.13 8.82 5.5-.59 1.22-1.42 2.27-2.41 3.12l1.41 1.41c1.39-1.23 2.49-2.77 3.18-4.53C21.27 7.11 17 4 12 4c-1.27 0-2.49.2-3.64.57l1.65 1.65C10.66 6.09 11.32 6 12 6zm-1.07 1.14L13 9.21c.57.25 1.03.71 1.28 1.28l2.07 2.07c.08-.34.14-.7.14-1.07C16.5 9.01 14.48 7 12 7c-.37 0-.72.05-1.07.14zM2.01 3.87l2.68 2.68C3.06 7.83 1.77 9.53 1 11.5 2.73 15.89 7 19 12 19c1.52 0 2.98-.29 4.32-.82l3.42 3.42 1.41-1.41L3.42 2.45 2.01 3.87zm7.5 7.5l2.61 2.61c-.04.01-.08.02-.12.02-1.38 0-2.5-1.12-2.5-2.5 0-.05.01-.08.01-.13zm-3.4-3.4l1.75 1.75c-.23.55-.36 1.15-.36 1.78 0 2.48 2.02 4.5 4.5 4.5.63 0 1.23-.13 1.77-.36l.98.98c-.88.24-1.8.38-2.75.38-3.79 0-7.17-2.13-8.82-5.5.7-1.43 1.72-2.61 2.93-3.53z"/></svg>
                        </div>

                        <Filler>
                          <div className={styles.button_title}>Редактировать</div>
                        </Filler>
                      </Group>
                    </div>
                  </Group>
                </Padder>

                <TagField>
                  <Tag title="Избранный" feature="red" />
                  <Tag title="Плэйлист" feature="green" />
                  <Tag title="Tag" />
                  <Tag title="Фотография" feature="black" />
                  <Tag title="С музыкой" feature="black" />
                </TagField>

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
