import React, { FC } from 'react';
import { Group } from '~/components/containers/Group';
import { INodeComponentProps } from '~/redux/node/constants';
import { Filler } from '~/components/containers/Filler';
import styles from './styles.module.scss';
import { getPrettyDate } from '~/utils/dom';

const LabBottomPanel: FC<INodeComponentProps> = ({ node }) => (
  <Group horizontal className={styles.wrap}>
    <div className={styles.timestamp}>{getPrettyDate(node.created_at)}</div>

    <Filler />
  </Group>
);

export { LabBottomPanel };
