import React, { createElement, FC, Fragment, useCallback } from 'react';
import { IBlock } from '~/redux/types';
import { prop } from 'ramda';
import { EDITOR_BLOCKS } from '~/redux/node/constants';
import { useNodeFormContext } from '~/utils/hooks/useNodeFormFormik';
import { NewEditorBetweenBlocks } from '~/containers/editors/NewEditorBetweenBlocks';
import styles from './styles.module.scss';
import { Group } from '~/components/containers/Group';

interface IProps {
  block: IBlock;
  index: number;
}

const NewEditorBlock: FC<IProps> = ({ block, index }) => {
  const { values, setFieldValue } = useNodeFormContext();

  const handler = useCallback(
    (val: IBlock) =>
      setFieldValue(
        'blocks',
        values.blocks.map((el, i) => (i === index ? val : el))
      ),
    [setFieldValue, values.blocks]
  );

  if (!prop(block.type, EDITOR_BLOCKS)) {
    return null;
  }

  return (
    <div className={styles.block}>
      {prop(block.type, EDITOR_BLOCKS)
        ? createElement(prop(block.type, EDITOR_BLOCKS), { block, handler })
        : null}

      <NewEditorBetweenBlocks />
    </div>
  );
};

export { NewEditorBlock };
