import React, { FC, useCallback } from 'react';
import { BlockType } from '~/redux/types';
import styles from './styles.module.scss';
import { Textarea } from '~/components/input/Textarea';
import { path } from 'ramda';
import { NodeEditorProps } from '~/redux/node/types';

type IProps = NodeEditorProps & {};

const TextEditor: FC<IProps> = ({ data, setData }) => {
  const setText = useCallback(
    (text: string) => setData({ ...data, blocks: [{ type: BlockType.text, text }] }),
    [data, setData]
  );

  const text = (path(['blocks', 0, 'text'], data) as string) || '';

  return (
    <div className={styles.wrap}>
      <Textarea value={text} handler={setText} minRows={6} />
    </div>
  );
};

export { TextEditor };
