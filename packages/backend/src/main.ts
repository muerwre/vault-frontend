import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';
import { CORS_OPTIONS } from './globals/cors';
import { DEV_PASSTHROUGH_MIDDLEWARE } from './globals/dev-proxy';
import { VaultExceptionFilter } from './globals/exceptions';
import { createSessionMiddleware, SESSION_PATH } from './globals/session';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: CORS_OPTIONS,
  });

  // Renders every failure as the `{ error, message }` envelope clients parse.
  app.useGlobalFilters(new VaultExceptionFilter());

  const devProxy = process.env.NODE_ENV === 'development';

  // In development the frontend's dev server sits behind this port too.
  if (devProxy) {
    app.use(DEV_PASSTHROUGH_MIDDLEWARE);
  }

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

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);

  // Hot reload holds a websocket open from the first page load; route its
  // upgrade explicitly rather than relying on a proxied request coming first.
  if (devProxy) {
    app.getHttpServer().on('upgrade', DEV_PASSTHROUGH_MIDDLEWARE.upgrade);
  }

  // eslint-disable-next-line no-console
  console.log(
    `[@vault/backend] listening on http://localhost:${port}` +
      (devProxy ? ' (app proxied from the frontend dev server)' : '/api'),
  );
}

void bootstrap();
