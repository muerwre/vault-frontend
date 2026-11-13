import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

/**
 * The allowed-header list must stay a superset of what the client sends
 * (`Authorization`, `Cache-Control`, …) — browsers reject a preflight that omits
 * any requested header.
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
  // Preflight answers 200, not Nest's default 204.
  optionsSuccessStatus: 200,
};
