export const showErrorToast = (error: unknown) => {
  if (!(error instanceof Error)) {
    console.warn('catched strange exception', error);
    return;
  }

  // TODO: show toast or something
  console.warn(error.message);
};
