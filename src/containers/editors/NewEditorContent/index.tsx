import React, { FC } from 'react';
import { useNodeFormContext } from '~/utils/hooks/useNodeFormFormik';
import styles from './styles.module.scss';
import { Group } from '~/components/containers/Group';
import { NewEditorBlock } from '~/containers/editors/NewEditorBlock';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { IBlock } from '~/redux/types';

interface IProps {}

const SortableItem = SortableElement(({ value, index }: { value: IBlock; index: number }) => (
  <NewEditorBlock index={index} block={value} />
));

const SortableList = SortableContainer(({ items }: { items: IBlock[] }) => (
  <div>
    {items.map((block, i) => (
      <SortableItem key={i} index={i} value={block} />
    ))}
  </div>
));

const NewEditorContent: FC<IProps> = () => {
  const { values } = useNodeFormContext();

  return (
    <Group className={styles.wrap}>
      <SortableList items={values.blocks} />
    </Group>
  );
};

export { NewEditorContent };
