import React, { FC } from "react";
import { Card } from "~/components/containers/Card";
import * as styles from "./styles.scss";
import {Padder} from "~/components/containers/Padder";
import {Group} from "~/components/containers/Group";
import {InputText} from "~/components/input/InputText";
import {Button} from "~/components/input/Button";
import {Filler} from "~/components/containers/Filler";
import {Icon} from "~/components/input/Icon";
import {CellGrid} from "~/components/containers/CellGrid";

interface IProps {}

const HorizontalExample: FC<IProps> = () => (
  <div className={styles.wrap}>
    <Card seamless className={styles.card}>
      <div className={styles.editor}>
        <Padder className={styles.uploads}>
          <CellGrid size={150}>
            <div className={styles.cell} />
          </CellGrid>
        </Padder>

        <Padder className={styles.features}>
          <Group horizontal>
            <div className={styles.feature_add_btn}>
              <Icon icon="plus" />
            </div>

            <div className={styles.feature}>
              <Group horizontal>
                <div>ОБЛОЖКА</div>
                <Icon icon="close" />
              </Group>
            </div>

            <Filler />

            <div className={styles.feature_cell}>
              <Icon icon="cell-single" size={24} />
            </div>
          </Group>
        </Padder>
      </div>

      <Padder className={styles.panel}>
        <Group horizontal>
          <InputText title="Название" />

          <Button title="Сохранить" iconRight="check" />
        </Group>
      </Padder>
    </Card>
  </div>
);

export { HorizontalExample };
