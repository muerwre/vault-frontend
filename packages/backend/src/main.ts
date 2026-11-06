import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';
import { getPublicUrl } from './config/env';
import { CORS_OPTIONS } from './globals/cors';
import { VaultExceptionFilter } from './globals/exceptions';
import { createFrontendProxy, getFrontendUrl } from './globals/frontend-proxy';
import { createSessionMiddleware, SESSION_PATH } from './globals/session';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: CORS_OPTIONS,
  });

  // Renders every failure as the `{ error, message }` envelope clients parse.
  app.useGlobalFilters(new VaultExceptionFilter());

  // Stored file urls resolve against `<public url>/static/`, a frozen public
  // shape; uploads are served under the api. Must run before the page proxy,
  // which would otherwise hand `/static` to the frontend.
  app.use((req: { url: string }, _res: unknown, next: () => void) => {
    if (req.url.startsWith('/static/')) {
      req.url = `/api${req.url}`;
    }

    next();
  });

  // Pages are rendered by the frontend server, reached through this port too.
  const frontendUrl = getFrontendUrl();
  const frontendProxy = frontendUrl ? createFrontendProxy(frontendUrl) : null;

  if (frontendProxy) {
    app.use(frontendProxy);
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
  if (frontendProxy) {
    app.getHttpServer().on('upgrade', frontendProxy.upgrade);
  }

  // eslint-disable-next-line no-console
  console.log(
    `[@vault/backend] listening on :${port}, public at ${getPublicUrl()}` +
      (frontendProxy ? `, pages from ${frontendUrl}` : ', api only'),
  );
}

void bootstrap();
