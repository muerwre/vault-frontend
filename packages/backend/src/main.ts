import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // All controllers are served under /api (matches the Go backend behind the proxy).
  app.setGlobalPrefix('api');

  const port = process.env.PORT ? Number(process.env.PORT) : 7777;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`[@vault/backend] listening on http://localhost:${port}/api`);
}

void bootstrap();
