import { VFC } from 'react';

import { Filler } from '~/components/common/Filler';
import { Group } from '~/components/common/Group';
import { Icon } from '~/components/common/Icon';
import { NodeHorizontalCard } from '~/components/common/NodeHorizontalCard';
import { Padder } from '~/components/common/Padder';
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
            <NodeHorizontalCard node={node} key={node.id} />
          </div>
        ))}
      </div>
    </Padder>
  );
};

export { SettingsDeleted };
