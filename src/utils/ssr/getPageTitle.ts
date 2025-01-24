/** just combines title elements to form title of the page */
export const getPageTitle = (...props: string[]): string => {
  return ['Убежище', ...props].filter((it) => it.trim()).join(' • ');
};
