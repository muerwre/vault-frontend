import { useCallback, useState } from 'react';

export const useFocusEvent = (initialState = false, delay = 0) => {
  const [focused, setFocused] = useState(initialState);

  const onFocus = useCallback(
    event => {
      event.preventDefault();
      event.stopPropagation();

      setFocused(true);
    },
    [setFocused]
  );
  const onBlur = useCallback(() => setTimeout(() => setFocused(false), delay), [delay]);

  return { focused, onBlur, onFocus };
};
