/**
 * Handles blur by detecting clicks outside refs.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useCloseOnEscape } from '~/utils/hooks/index';

export const useClickOutsideFocus = () => {
  const ref = useRef<HTMLElement>();
  const [isActive, setIsActive] = useState(false);

  const activate = useCallback(() => setIsActive(true), [setIsActive]);
  const deactivate = useCallback(() => setIsActive(false), [setIsActive]);

  useEffect(() => {
    if (!isActive || !ref.current) {
      return;
    }

    const deactivator = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) {
        deactivate();
      }
    };

    document.addEventListener('mouseup', deactivator);

    return () => document.removeEventListener('mouseup', deactivator);
  }, [deactivate, isActive]);

  useCloseOnEscape(deactivate);

  return { ref, isActive, activate, deactivate };
};
