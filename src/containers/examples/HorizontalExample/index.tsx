import React, { FC } from "react";
import { Card } from "~/components/containers/Card";
import * as styles from "./styles.scss";
import {Padder} from "~/components/containers/Padder";
import {Group} from "~/components/containers/Group";
import {InputText} from "~/components/input/InputText";
import {Button} from "~/components/input/Button";

interface IProps {}

const HorizontalExample: FC<IProps> = () => (
  <div className={styles.wrap}>
    <Card seamless className={styles.card}>
      <div className={styles.editor}>

      </div>

      <Padder className={styles.panel}>
        <Group horizontal>
          <InputText title="Название" />

          <Button title="Сохранить" iconRight="play" />
        </Group>
      </Padder>
    </Card>
  </div>
);

export { HorizontalExample };
