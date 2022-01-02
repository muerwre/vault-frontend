import { useCallback, useState } from 'react';

export const useFocusEvent = (initialState = false) => {
  const [focused, setFocused] = useState(initialState);

  const onFocus = useCallback(
    event => {
      event.preventDefault();
      event.stopPropagation();

      setFocused(true);
    },
    [setFocused]
  );
  const onBlur = useCallback(() => setTimeout(() => setFocused(false), 300), [setFocused]);

  return { focused, onBlur, onFocus };
};
