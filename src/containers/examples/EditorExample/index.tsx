import React, { FC } from 'react';
import { Card } from "~/components/containers/Card";
import * as styles from './styles.scss';
import { Group } from "~/components/containers/Group";
import { Padder } from "~/components/containers/Padder";
import { CellGrid } from "~/components/containers/CellGrid";
import { Panel } from "~/components/containers/Panel";
import { TextInput } from "~/components/input/TextInput";
import classNames = require("classnames");
import { Scroll } from "~/components/containers/Scroll";
import { Grid } from "~/components/containers/Grid";
import { Tags } from "~/components/node/Tags";
import { Button } from "~/components/input/Button";
import { Filler } from "~/components/containers/Filler";
import { InputText } from "~/components/input/InputText";

interface IProps {}

const EditorExample: FC<IProps> = () => (
    <Card className={styles.wrap} seamless>
      <Group horizontal className={styles.group} seamless>
        <div className={styles.editor}>
          <Panel>
            <TextInput onChange={console.log} label="Название" value="Значение" />
          </Panel>

          <Panel>
            <InputText title="Заголовок" />
          </Panel>

          <Panel className={classNames(styles.editor_panel, styles.editor_image_panel)}>
            <Scroll>
              <CellGrid className={styles.editor_image_container} size={200}>
                <div className={styles.editor_image} />
                <div className={styles.editor_image} />
                <div className={styles.editor_image} />
                <div className={styles.editor_image} />
              </CellGrid>
            </Scroll>
          </Panel>
        </div>

        <div className={styles.panel}>
          <Filler>
            <Padder>
              <Group>
                <Card className={styles.feature_card}>Layout setup</Card>

                <Card className={styles.feature_card}>Cover changer</Card>

                <Card className={styles.feature_card}>Track</Card>

                <Tags
                  tags={[
                    { title: 'Избранный', feature: 'red' },
                    { title: 'Плейлист', feature: 'green' },
                    { title: 'Просто' },
                    { title: '+ фото', feature: 'black' },
                    { title: '+ с музыкой', feature: 'black' },
                  ]}
                />

                <Filler />

              </Group>
            </Padder>
          </Filler>

          <Panel>
            <Button>Submit?</Button>
          </Panel>
        </div>
      </Group>
    </Card>
);

export { EditorExample };
