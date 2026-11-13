import { FC, useCallback } from 'react';

import { Textarea } from '~/components/input/Textarea';
import { useRandomPhrase } from '~/constants/phrases';
import { useWindowSize } from '~/hooks/dom/useWindowSize';
import { useNodeFormContext } from '~/hooks/node/useNodeFormFormik';
import { IBlock } from '~/types';
import { NodeEditorProps } from '~/types/node';

import styles from './styles.module.scss';

/**
 * Text node content: one textarea that fills the main zone and grows past it.
 * Video blocks are kept, so switching the type back and forth loses nothing.
 */
const SubmitTextEditor: FC<NodeEditorProps> = () => {
  const { values, setFieldValue } = useNodeFormContext();
  const placeholder = useRandomPhrase('SIMPLE');
  // mobile has no free height to fill, so it starts taller instead
  const { isTablet } = useWindowSize();

  const block = values.blocks.find((it) => it.type === 'text');
  const text = block?.type === 'text' ? block.text : '';

  const setText = useCallback(
    (value: string) => {
      const textBlock: IBlock = { type: 'text', text: value };

      setFieldValue('blocks', [
        textBlock,
        ...values.blocks.filter((it) => it.type !== 'text'),
      ]);
    },
    [setFieldValue, values.blocks],
  );

  return (
    <div className={styles.wrap}>
      <Textarea
        value={text}
        handler={setText}
        minRows={isTablet ? 12 : 6}
        placeholder={placeholder}
        className={styles.textarea}
      />
    </div>
  );
};

export { SubmitTextEditor };
