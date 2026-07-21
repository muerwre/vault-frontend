import { FC, useCallback } from 'react';

import { Textarea } from '~/components/input/Textarea';
import { useRandomPhrase } from '~/constants/phrases';
import { useNodeFormContext } from '~/hooks/node/useNodeFormFormik';
import { NodeEditorProps } from '~/types/node';
import { path } from '~/utils/ramda';

import styles from './styles.module.scss';

type Props = NodeEditorProps & {};

const TextEditor: FC<Props> = () => {
  const { values, setFieldValue } = useNodeFormContext();
  const placeholder = useRandomPhrase('SIMPLE');

  const setText = useCallback(
    (text: string) => setFieldValue('blocks', [{ type: 'text', text }]),
    [setFieldValue],
  );

  const text = (path(['blocks', 0, 'text'], values) as string) || '';

  return (
    <div className={styles.wrap}>
      <Textarea
        value={text}
        handler={setText}
        minRows={6}
        placeholder={placeholder}
      />
    </div>
  );
};

export { TextEditor };
