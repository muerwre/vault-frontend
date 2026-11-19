import { FC, useCallback, useState } from 'react';

import {
  MarkdownEditor,
  MarkdownFormatter,
} from '~/components/input/MarkdownEditor';
import { MarkdownFormatButtons } from '~/components/input/MarkdownFormatButtons';
import { useRandomPhrase } from '~/constants/phrases';
import { useNodeFormContext } from '~/hooks/node/useNodeFormFormik';
import { NodeEditorProps } from '~/types/node';
import { path } from '~/utils/ramda';

import styles from './styles.module.scss';

type Props = NodeEditorProps & {};

const TextEditor: FC<Props> = () => {
  const { values, setFieldValue } = useNodeFormContext();
  const placeholder = useRandomPhrase('SIMPLE');
  const [formatter, setFormatter] = useState<MarkdownFormatter | null>(null);

  const setText = useCallback(
    (text: string) => setFieldValue('blocks', [{ type: 'text', text }]),
    [setFieldValue],
  );

  const text = (path(['blocks', 0, 'text'], values) as string) || '';

  return (
    <div className={styles.wrap}>
      <MarkdownEditor
        value={text}
        onChange={setText}
        onFormatter={setFormatter}
        header={
          formatter && <MarkdownFormatButtons formatter={formatter} headings />
        }
        minRows={6}
        placeholder={placeholder}
      />
    </div>
  );
};

export { TextEditor };
