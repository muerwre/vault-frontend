export const isTablet = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.innerWidth < 599;
};

export const headerHeight = 64; // px
