import React, { FC } from 'react';
import { Card } from "~/components/containers/Card";
import * as styles from './styles.scss';
import { Group } from "~/components/containers/Group";
import { Padder } from "~/components/containers/Padder";
import { CellGrid } from "~/components/containers/CellGrid";
import { Panel } from "~/components/containers/Panel";
import classNames = require("classnames");
import { Scroll } from "~/components/containers/Scroll";
import { Tags } from "~/components/node/Tags";
import { Button } from "~/components/input/Button";
import { InputText } from "~/components/input/InputText";
import {Grid} from "~/components/containers/Grid";

interface IProps {}

const HorizontalExample: FC<IProps> = () => (
  <Card className={styles.wrap} seamless>
    <Group className={styles.group} seamless>
      <div className={styles.editor}>
        <Panel className={classNames(styles.editor_panel, styles.editor_image_panel)}>
          <Scroll autoHeight autoHeightMax={500}>
            <CellGrid className={styles.editor_image_container} size={200}>
              <div className={styles.editor_image} />
              <div className={styles.editor_image} />
              <div className={styles.editor_image} />
              <div className={styles.editor_image} />
              <div className={styles.editor_image} />
              <div className={styles.editor_image} />
              <div className={styles.editor_image} />
              <div className={styles.editor_image} />
              <div className={styles.editor_image} />
              <div className={styles.editor_image} />
              <div className={styles.editor_image} />
              <div className={styles.editor_image} />
              <div className={styles.editor_image} />
              <div className={styles.editor_image} />
            </CellGrid>
          </Scroll>
        </Panel>
        <Panel>
          <InputText title="Заголовок" />
        </Panel>
      </div>

      <div className={styles.panel}>
        <Padder>
          <Grid columns="1fr 1fr 1fr">
            <Group>
              <Card className={styles.feature_card}>Layout setup</Card>

              <Card className={styles.feature_card}>Cover changer</Card>

              <Card className={styles.feature_card}>Track</Card>
            </Group>

            <div>
              <Tags
                tags={[
                  { title: 'Избранный', feature: 'red' },
                  { title: 'Плейлист', feature: 'green' },
                  { title: 'Просто' },
                  { title: '+ фото', feature: 'black' },
                  { title: '+ с музыкой', feature: 'black' },
                ]}
              />
            </div>

            <div>
              <Button>Submit?</Button>
            </div>
          </Grid>
        </Padder>
      </div>
    </Group>
  </Card>
);

export { HorizontalExample };
