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
    html.offsetHeight,
  );
};
export const useScrollHeight = () => getHeight();
