import React, { FC, useCallback } from 'react';
import { INode } from '~/redux/types';
import styles from './styles.module.scss';
import { Textarea } from '~/components/input/Textarea';
import { path } from 'ramda';
import { NodeEditorProps } from '~/redux/node/types';
import { useNodeFormContext } from '~/utils/hooks/node/useNodeFormFormik';

type IProps = NodeEditorProps & {};

const TextEditor: FC<IProps> = () => {
  const { values, setFieldValue } = useNodeFormContext();

  const setText = useCallback((text: string) => setFieldValue('blocks', [{ type: 'text', text }]), [
    setFieldValue,
  ]);

  const text = (path(['blocks', 0, 'text'], values) as string) || '';

  return (
    <div className={styles.wrap}>
      <Textarea value={text} handler={setText} minRows={6} />
    </div>
  );
};

export { TextEditor };
