import React, { FC, useCallback } from 'react';
import styles from './styles.module.scss';
import { Textarea } from '~/components/input/Textarea';
import { path } from 'ramda';
import { NodeEditorProps } from '~/types/node';
import { useNodeFormContext } from '~/hooks/node/useNodeFormFormik';
import { useRandomPhrase } from '~/constants/phrases';

type IProps = NodeEditorProps & {};

const TextEditor: FC<IProps> = () => {
  const { values, setFieldValue } = useNodeFormContext();
  const placeholder = useRandomPhrase('SIMPLE');

  const setText = useCallback((text: string) => setFieldValue('blocks', [{ type: 'text', text }]), [
    setFieldValue,
  ]);

  const text = (path(['blocks', 0, 'text'], values) as string) || '';

  return (
    <div className={styles.wrap}>
      <Textarea value={text} handler={setText} minRows={6} placeholder={placeholder} />
    </div>
  );
};

export { TextEditor };
