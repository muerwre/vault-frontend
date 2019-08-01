import React, { FC } from "react";
import { Card } from "~/components/containers/Card";
import * as styles from "./styles.scss";
import { Group } from "~/components/containers/Group";
import { Padder } from "~/components/containers/Padder";
import { CellGrid } from "~/components/containers/CellGrid";
import { Panel } from "~/components/containers/Panel";
import classNames = require("classnames");
import { Scroll } from "~/components/containers/Scroll";
import { Tags } from "~/components/node/Tags";
import { Button } from "~/components/input/Button";
import { InputText } from "~/components/input/InputText";
import { Grid } from "~/components/containers/Grid";

interface IProps {}

const HorizontalExample: FC<IProps> = () => (
  <Card className={styles.wrap} seamless>
    <Group className={styles.group} seamless>
      <div className={styles.editor}>
        <Scroll>
          <Padder>
            <CellGrid className={styles.editor_image_container} size={200}>
              <div className={styles.editor_image} />
              <div className={styles.editor_image} />
              <div className={styles.editor_image} />
              <div className={styles.editor_image} />
              <div className={styles.editor_image} />
              <div className={styles.editor_image} />
              <div className={styles.editor_image} />
              <div className={styles.editor_image} />
            </CellGrid>
          </Padder>
        </Scroll>
      </div>

      <div className={styles.panel}>
        <Padder>
          <Grid columns="2fr 1fr 1fr">
            <div>
              <Group>
                <InputText title="Название" />

                <Tags
                  tags={[
                    { title: "Избранный", feature: "red" },
                    { title: "Плейлист", feature: "green" },
                    { title: "Просто" },
                    { title: "+ фото", feature: "black" },
                    { title: "+ с музыкой", feature: "black" }
                  ]}
                />
              </Group>
            </div>

            <div />

            <div />
          </Grid>
        </Padder>
      </div>
    </Group>
  </Card>
);

export { HorizontalExample };
