import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';
import { CORS_OPTIONS } from './globals/cors';
import { VaultExceptionFilter } from './globals/exceptions';
import { createSessionMiddleware, SESSION_PATH } from './globals/session';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: CORS_OPTIONS,
  });

  // Renders every failure as the `{ error, message }` envelope clients parse.
  app.useGlobalFilters(new VaultExceptionFilter());

  // Only the OAuth handshake needs server-side state; see globals/session.ts.
  app.use(SESSION_PATH, createSessionMiddleware());

  // All controllers are served under /api, matching the reverse proxy.
  app.setGlobalPrefix('api');

  /**
   * Clients call several paths with a trailing slash (`/nodes/`, `/stats/`, …).
   * Loose routing must stay on: a 301 to the canonical form drops the
   * Authorization header on some clients.
   */
  app.set('strict routing', false);

  const port = process.env.PORT ? Number(process.env.PORT) : 7777;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`[@vault/backend] listening on http://localhost:${port}/api`);
}

void bootstrap();
