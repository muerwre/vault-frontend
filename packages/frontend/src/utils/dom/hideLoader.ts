export const hideLoader = () => {
  const loader = document.getElementById('main_loader');

  if (!loader) {
    return;
  }

  loader.style.display = 'none';
};
