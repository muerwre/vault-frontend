import { FC, useCallback, useState } from 'react';

import {
  MarkdownEditor,
  MarkdownFormatter,
} from '~/components/input/MarkdownEditor';
import { MarkdownFormatButtons } from '~/components/input/MarkdownFormatButtons';
import { useRandomPhrase } from '~/constants/phrases';
import { useNodeFormContext } from '~/hooks/node/useNodeFormFormik';
import { NodeEditorProps } from '~/types/node';
import { getFirstText } from '~/utils/blocks';

import styles from './styles.module.scss';

type Props = NodeEditorProps & {};

const TextEditor: FC<Props> = () => {
  const { values, setFieldValue } = useNodeFormContext();
  const placeholder = useRandomPhrase('SIMPLE');
  const [formatter, setFormatter] = useState<MarkdownFormatter | null>(null);

  // edits the first text block, keeping any others the post has
  const setText = useCallback(
    (text: string) => {
      const index = values.blocks.findIndex((it) => it.type === 'text');

      setFieldValue(
        'blocks',
        index < 0
          ? [{ type: 'text', text }, ...values.blocks]
          : values.blocks.map((it, i) => (i === index ? { ...it, text } : it)),
      );
    },
    [setFieldValue, values.blocks],
  );

  const text = getFirstText(values.blocks);

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
