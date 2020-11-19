import React, { FC, useCallback } from 'react';
import { INode } from '~/redux/types';
import styles from './styles.module.scss';
import { Textarea } from '~/components/input/Textarea';
import { path } from 'ramda';

interface IProps {
  data: INode;
  setData: (val: INode) => void;
}

const TextEditor: FC<IProps> = ({ data, setData }) => {
  const setText = useCallback(
    (text: string) => setData({ ...data, blocks: [{ type: 'text', text }] }),
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
