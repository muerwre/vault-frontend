import { multerOptions } from './upload.controller';

describe('upload limits', () => {
  const saved = process.env.UPLOADS_MAX_SIZE_MB;

  afterEach(() => {
    if (saved === undefined) {
      delete process.env.UPLOADS_MAX_SIZE_MB;
    } else {
      process.env.UPLOADS_MAX_SIZE_MB = saved;
    }
  });

  /**
   * Multer buffers the whole body in memory, so a request has to be refused by
   * size before it is read, not after.
   */
  it('caps the multipart body at the configured size', () => {
    process.env.UPLOADS_MAX_SIZE_MB = '7';

    expect(multerOptions().limits?.fileSize).toBe(7 * 1024 * 1024);
  });

  it('always sets a limit, whatever the configuration says', () => {
    delete process.env.UPLOADS_MAX_SIZE_MB;

    expect(multerOptions().limits?.fileSize).toBeGreaterThan(0);
  });
});
