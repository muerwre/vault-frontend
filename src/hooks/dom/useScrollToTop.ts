import { useEffect } from 'react';
import { NEW_COMMENT_CLASSNAME } from '~/constants/comment';

export const useScrollToTop = (deps?: any[]) => {
  useEffect(
    () => {
      const targetElement = document.querySelector(`.${NEW_COMMENT_CLASSNAME}`);

      if (!targetElement) {
        window.scrollTo(0, 0);
        return;
      }

      const bounds = targetElement.getBoundingClientRect();
      window.scrollTo({
        top: bounds.top - 100,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps && Array.isArray(deps) ? deps : []
  );
};
