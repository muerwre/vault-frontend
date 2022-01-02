const handle = (message: string) => console.warn(message);

export const showErrorToast = (error: unknown) => {
  if (typeof error === 'string') {
    handle(error);
    return;
  }

  if (!(error instanceof Error)) {
    console.warn('catched strange exception', error);
    return;
  }

  handle(error.message);
};
