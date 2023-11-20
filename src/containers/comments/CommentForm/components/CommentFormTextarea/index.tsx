import {
  forwardRef,
  KeyboardEventHandler,
  TextareaHTMLAttributes,
  useCallback,
} from 'react';

import { Textarea } from '~/components/input/Textarea';
import { useRandomPhrase } from '~/constants/phrases';
import { useCommentFormContext } from '~/hooks/comments/useCommentFormFormik';

interface IProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  isLoading?: boolean;
}

const CommentFormTextarea = forwardRef<HTMLTextAreaElement, IProps>(
  ({ ...rest }, ref) => {
    const { values, handleChange, handleSubmit, isSubmitting } =
      useCommentFormContext();

    const onKeyDown = useCallback<KeyboardEventHandler<HTMLTextAreaElement>>(
      ({ ctrlKey, key, metaKey }) => {
        if ((ctrlKey || metaKey) && key === 'Enter') handleSubmit(undefined);
      },
      [handleSubmit],
    );

    const placeholder = useRandomPhrase('SIMPLE');

    return (
      <Textarea
        {...rest}
        ref={ref}
        value={values.text}
        handler={handleChange('text')}
        onKeyDown={onKeyDown}
        disabled={isSubmitting}
        placeholder={placeholder}
      />
    );
  },
);

export { CommentFormTextarea };
