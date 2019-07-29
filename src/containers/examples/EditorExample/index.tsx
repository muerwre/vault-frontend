import React, { FC } from 'react';
import { Card } from "~/components/containers/Card";
import * as styles from './styles.scss';
import { Group } from "~/components/containers/Group";

interface IProps {}

const EditorExample: FC<IProps> = () => (
    <Card className={styles.wrap}>
      <Group horizontal className={styles.group}>
        <div className={styles.editor}>
          editor
        </div>

        <div className={styles.panel}>
          panel
        </div>
      </Group>
    </Card>
);

export { EditorExample };
