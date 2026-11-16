/** Timestamped lines on stdout/stderr, for `docker logs`. */
export const log = {
  info: (message: string) =>
    console.log(`${new Date().toISOString()} ${message}`),
  error: (message: string) =>
    console.error(`${new Date().toISOString()} ${message}`),
};

export const describeError = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);
