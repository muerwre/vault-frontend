import React, { createElement, FC, useCallback, useMemo } from 'react';
import { useNodeFormContext } from '~/utils/hooks/useNodeFormFormik';
import { NODE_EDITOR_BLOCKS } from '~/redux/node/constants';
import { has, prop } from 'ramda';
import styles from './styles.module.scss';
import { Group } from '~/components/containers/Group';
import { IBlock } from '~/redux/types';

interface IProps {}

const NewEditorContent: FC<IProps> = () => {
  const { values, setFieldValue } = useNodeFormContext();

  const onChange = useCallback(
    (index: number) => (val: IBlock) =>
      setFieldValue(
        'blocks',
        values.blocks.map((el, i) => (i === index ? val : el))
      ),
    [setFieldValue, values.blocks]
  );

  return (
    <Group className={styles.wrap}>
      {values.blocks.map((block, i) =>
        prop(block.type, NODE_EDITOR_BLOCKS)
          ? createElement(prop(block.type, NODE_EDITOR_BLOCKS), { block, handler: onChange(i) })
          : null
      )}
    </Group>
  );
};

export { NewEditorContent };
