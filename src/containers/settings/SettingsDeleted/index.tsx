import React, { VFC } from 'react';

import { Filler } from '~/components/common/Filler';
import { Group } from '~/components/common/Group';
import { Padder } from '~/components/common/Padder';
import { FlowRecentItem } from '~/components/flow/FlowRecentItem';
import { Icon } from '~/components/input/Icon';
import { InputText } from '~/components/input/InputText';
import { HorizontalMenu } from '~/components/menu/HorizontalMenu';
import { useFlowStore } from '~/store/flow/useFlowStore';

import styles from './styles.module.scss';

interface SettingsDeletedProps {}

const SettingsDeleted: VFC<SettingsDeletedProps> = () => {
  const { nodes } = useFlowStore();

  return (
    <Padder>
      <Group horizontal>
        <HorizontalMenu>
          <HorizontalMenu.Item active>Новые</HorizontalMenu.Item>
          <HorizontalMenu.Item>Старые</HorizontalMenu.Item>
        </HorizontalMenu>

        <Filler />

        <InputText suffix={<Icon icon="search" size={24} />} />
      </Group>

      <br />

      <div className={styles.grid}>
        {nodes.map((node) => (
          <div className={styles.item} key={node.id}>
            <FlowRecentItem node={node} key={node.id} />
          </div>
        ))}
      </div>
    </Padder>
  );
};

export { SettingsDeleted };
