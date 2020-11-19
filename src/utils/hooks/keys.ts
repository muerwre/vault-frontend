import { useCallback, useEffect } from 'react';

export const useArrows = (onNext: () => void, onPrev: () => void, locked) => {
  const onKeyDown = useCallback(
    event => {
      if ((event.target.tagName && ['TEXTAREA', 'INPUT'].includes(event.target.tagName)) || locked)
        return;

      switch (event.key) {
        case 'ArrowLeft':
          return onPrev();
        case 'ArrowRight':
          return onNext();
      }
    },
    [onNext, onPrev, locked]
  );

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);
};
