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

interface IProps {}

const EditorExample: FC<IProps> = () => (
    <Card className={styles.wrap}>
      <Group horizontal className={styles.group} seamless>
        <div className={styles.editor}>
          <Panel className={styles.editor_panel}>
            <TextInput onChange={console.log} label="Название" />
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

          <Panel className={styles.editor_panel}>
            Cover panel
          </Panel>
        </div>

        <div className={styles.panel}>
          <Group>
            <Card>
              <Padder>
                panel
              </Padder>
            </Card>
          </Group>
        </div>
      </Group>
    </Card>
);

export { EditorExample };
