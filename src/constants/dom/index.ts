export const isTablet = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.innerWidth < 599;
};
