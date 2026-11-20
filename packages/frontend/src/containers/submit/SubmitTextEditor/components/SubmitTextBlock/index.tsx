import { FC, useCallback, useState } from 'react';

import {
  MarkdownEditor,
  MarkdownFormatter,
} from '~/components/input/MarkdownEditor';
import { MarkdownFormatButtons } from '~/components/input/MarkdownFormatButtons';
import { useRandomPhrase } from '~/constants/phrases';
import { useWindowSize } from '~/hooks/dom/useWindowSize';
import { IBlockText } from '~/types';

import { BlockEditorProps } from '../../types';

/** A markdown editor with its formatting buttons. */
const SubmitTextBlock: FC<BlockEditorProps<IBlockText>> = ({
  block,
  onChange,
  disabled,
}) => {
  const placeholder = useRandomPhrase('SIMPLE');
  const [formatter, setFormatter] = useState<MarkdownFormatter | null>(null);
  // mobile has no free height to fill, so it starts taller instead
  const { isTablet } = useWindowSize();

  const setText = useCallback(
    (text: string) => onChange((it) => ({ ...it, text })),
    [onChange],
  );

  return (
    <MarkdownEditor
      value={block.text}
      onChange={setText}
      onFormatter={setFormatter}
      header={
        formatter && <MarkdownFormatButtons formatter={formatter} headings />
      }
      minRows={isTablet ? 8 : 4}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
};

export { SubmitTextBlock };
