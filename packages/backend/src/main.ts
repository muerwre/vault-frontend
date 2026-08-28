import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';
import { CORS_OPTIONS } from './globals/cors';
import { VaultExceptionFilter } from './globals/exceptions';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: CORS_OPTIONS,
  });

  /**
   * Renders every failure as `{ error, message }` — the envelope the frontend's
   * axios interceptor parses. Applied globally so Nest's own exceptions (404s
   * from unmatched routes, body-parser 413s) use it too.
   */
  app.useGlobalFilters(new VaultExceptionFilter());

  // All controllers are served under /api (matches the Go backend behind the proxy).
  app.setGlobalPrefix('api');

  /**
   * The frontend calls several paths with a trailing slash (`GET /nodes/`,
   * `POST /auth`, `GET /stats/`, …). Express' default non-strict routing already
   * matches both spellings; keep it that way, because a 301 to the canonical form
   * would drop the Authorization header on some clients.
   */
  app.set('strict routing', false);

  const port = process.env.PORT ? Number(process.env.PORT) : 7777;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`[@vault/backend] listening on http://localhost:${port}/api`);
}

void bootstrap();
