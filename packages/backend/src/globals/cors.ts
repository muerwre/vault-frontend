import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

/**
 * CORS settings copied from what the Go backend sent on every response.
 *
 * The header list is reproduced verbatim rather than trimmed: the frontend's
 * axios instance sends `Authorization` and `Cache-Control`, and browsers reject a
 * preflight whose `Allow-Headers` omits any requested header.
 */
export const CORS_OPTIONS: CorsOptions = {
  origin: '*',
  credentials: true,
  methods: ['POST', 'OPTIONS', 'GET', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Content-Length',
    'Accept-Encoding',
    'X-CSRF-Token',
    'Authorization',
    'accept',
    'origin',
    'Cache-Control',
    'X-Requested-With',
  ],
  /**
   * Go answered `OPTIONS` with a bare 200. Nest's default is 204, which is also
   * legal, but 200 keeps byte-compatibility with anything that asserted on it.
   */
  optionsSuccessStatus: 200,
};
