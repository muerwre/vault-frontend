import React, { FC } from "react";
import { Card } from "~/components/containers/Card";
import * as styles from "./styles.scss";
import {Padder} from "~/components/containers/Padder";
import {Group} from "~/components/containers/Group";
import {InputText} from "~/components/input/InputText";
import {Button} from "~/components/input/Button";
import {Filler} from "~/components/containers/Filler";
import {Icon} from "~/components/input/Icon";

interface IProps {}

const HorizontalExample: FC<IProps> = () => (
  <div className={styles.wrap}>
    <Card seamless className={styles.card}>
      <div className={styles.editor}>
        <div className={styles.uploads}>
          <div className={styles.cell} />
          <div className={styles.cell} />
          <div className={styles.cell} />
          <div className={styles.cell} />
          <div className={styles.cell} />
          <div className={styles.cell} />
        </div>

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
