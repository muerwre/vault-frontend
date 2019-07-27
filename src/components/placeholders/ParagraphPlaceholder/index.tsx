import React, { FC } from 'react';
import { Placeholder } from "~/components/placeholders/Placeholder";
import * as styles from './styles.scss';
import {Group} from "~/components/containers/Group";

const ParagraphPlaceholder = ({ }) => (
  <Group>
    <div className={styles.para}>
      <Placeholder width={120} />
      <Placeholder width={60} />
      <Placeholder width={30} />
      <Placeholder width={70} />
      <Placeholder width={160} />
      <Placeholder width={30} />
    </div>

    <div className={styles.para}>
      <Placeholder width={40} />
      <Placeholder width={30} />
      <Placeholder width={120} />
      <Placeholder width={70} />
      <Placeholder width={160} />
      <Placeholder width={30} />
    </div>
  </Group>
);

export { ParagraphPlaceholder };
