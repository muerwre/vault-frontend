export const openUserProfile = (username?: string) => {
  if (!username) {
    return;
  }

  window.postMessage({ type: 'username', username }, '*');
};
