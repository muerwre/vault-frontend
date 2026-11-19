import { FC, useCallback } from 'react';

import {
  MarkdownEditor,
  MarkdownFormatter,
} from '~/components/input/MarkdownEditor';
import { useRandomPhrase } from '~/constants/phrases';
import { useCommentFormContext } from '~/hooks/comments/useCommentFormFormik';

interface Props {
  onPaste?: (event: ClipboardEvent) => void;
  onFormatter?: (formatter: MarkdownFormatter | null) => void;
}

const CommentFormTextarea: FC<Props> = ({ onPaste, onFormatter }) => {
  const { values, handleChange, handleSubmit, isSubmitting } =
    useCommentFormContext();

  const onSubmit = useCallback(() => handleSubmit(undefined), [handleSubmit]);
  const placeholder = useRandomPhrase('SIMPLE');

  return (
    <MarkdownEditor
      value={values.text}
      onChange={handleChange('text')}
      onSubmit={onSubmit}
      onPaste={onPaste}
      onFormatter={onFormatter}
      disabled={isSubmitting}
      placeholder={placeholder}
      loadOnIntent
    />
  );
};

export { CommentFormTextarea };
