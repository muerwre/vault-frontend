import { useEffect, useState } from 'react';

const getHeight = () => {
  if (typeof document === 'undefined') {
    return 0;
  }

  const body = document.body;
  const html = document.documentElement;

  return Math.max(
    body.scrollHeight,
    body.offsetHeight,
    html.clientHeight,
    html.scrollHeight,
    html.offsetHeight
  );
};
export const useScrollHeight = () => {
  const [scrollHeight, setScrollHeight] = useState(getHeight());

  useEffect(() => {
    const measure = () => setScrollHeight(getHeight());

    window.addEventListener('scroll', measure);
    window.addEventListener('resize', measure);

    return () => {
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, []);

  return scrollHeight;
};
