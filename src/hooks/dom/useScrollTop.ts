import { useEffect, useState } from 'react';

export const useScrollTop = () => {
  const [top, setTop] = useState(typeof window !== 'undefined' ? window.scrollY : 0);

  useEffect(() => {
    const onScroll = () => {
      setTop(window.scrollY);
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return top;
};
