import type { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { getDataSourceToken } from '@nestjs/typeorm';
import * as jwt from 'jsonwebtoken';
import type { DataSource } from 'typeorm';

import { AppModule } from '../../src/app.module';
import { getJwtSecret, loadConfig } from '../../src/config/env';
import { CORS_OPTIONS } from '../../src/globals/cors';
import { VaultExceptionFilter } from '../../src/globals/exceptions';

loadConfig();

/**
 * Boots the real application — real database, real guards, real exception
 * filter — configured exactly as `main.ts` does, so specs exercise the same
 * request pipeline production will.
 *
 * Requires the seeded local database (`yarn db:up`). Integration specs run
 * serially because they share it.
 */
export const createTestApp = async (): Promise<INestApplication> => {
  // NestFactory rather than @nestjs/testing, which ships ESM-only and cannot be
  // required from a CommonJS jest run. No provider overrides are needed here.
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: CORS_OPTIONS,
    logger: false,
    // Otherwise a startup failure exits the process with no output.
    abortOnError: false,
  });

  app.useGlobalFilters(new VaultExceptionFilter());
  app.setGlobalPrefix('api');
  app.set('strict routing', false);

  await app.init();

  return app;
};

export const getDataSource = (app: INestApplication): DataSource =>
  app.get<DataSource>(getDataSourceToken(), { strict: false });

/**
 * A token in the frozen format: HS256, `{ uid, nme, rol, iat }`, and no `exp`.
 * Never pass `noTimestamp` — it strips the `iat` in the payload too.
 */
export const tokenFor = (
  uid: number,
  role: 'user' | 'admin' | 'guest' = 'user',
  username = 'spec',
): string =>
  jwt.sign(
    { uid, nme: username, rol: role, iat: Math.floor(Date.now() / 1000) },
    getJwtSecret(),
    { algorithm: 'HS256' },
  );

export const authHeader = (
  uid: number,
  role: 'user' | 'admin' | 'guest' = 'user',
): Record<string, string> => ({ Authorization: `Bearer ${tokenFor(uid, role)}` });

/** Every date on the wire must look like this: RFC3339 UTC, no fraction. */
export const WIRE_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
