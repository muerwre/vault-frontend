import React, { FC, KeyboardEventHandler, useCallback } from 'react';
import { Textarea } from '~/components/input/Textarea';
import { useCommentFormContext } from '~/hooks/comments/useCommentFormFormik';
import { useRandomPhrase } from '~/constants/phrases';

interface IProps {
  isLoading?: boolean;
  setRef?: (r: HTMLTextAreaElement) => void;
}

const LocalCommentFormTextarea: FC<IProps> = ({ setRef }) => {
  const { values, handleChange, handleSubmit, isSubmitting } = useCommentFormContext();

  const onKeyDown = useCallback<KeyboardEventHandler<HTMLTextAreaElement>>(
    ({ ctrlKey, key }) => {
      if (ctrlKey && key === 'Enter') handleSubmit(undefined);
    },
    [handleSubmit]
  );

  const placeholder = useRandomPhrase('SIMPLE');

  return (
    <Textarea
      value={values.text}
      handler={handleChange('text')}
      onKeyDown={onKeyDown}
      disabled={isSubmitting}
      placeholder={placeholder}
      minRows={2}
      setRef={setRef}
    />
  );
};

export { LocalCommentFormTextarea };
