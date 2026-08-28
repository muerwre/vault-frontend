/**
 * Verifies the auth plumbing against a hand-crafted token in the legacy format:
 * HS256, claims `{ uid, nme, rol, iat }`, and crucially **no `exp`**. Tokens in
 * the wild never expire, so a regression here logs out every user.
 *
 * Boots the real AppModule plus a throwaway controller exercising each guard
 * level, then drives it over HTTP.
 *
 * Usage: yarn auth-check
 */
import { Controller, Get, Module, UseGuards } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { ITokenClaims } from '@vault/common/types';
import * as jwt from 'jsonwebtoken';

import { AppModule } from '../app.module';
import { getJwtSecret, loadConfig } from '../config/env';
import { dataSource } from '../database/data-source';
import { User } from '../entities/user.entity';
import {
  AuthRequiredGuard,
  OptionalAuthGuard,
  Uid,
  WithUser,
  WithUserGuard,
} from '../modules/auth/auth.guards';
import { CORS_OPTIONS } from './cors';
import { VaultExceptionFilter } from './exceptions';

loadConfig();

@Controller('__authcheck')
class AuthCheckController {
  @Get('optional')
  @UseGuards(OptionalAuthGuard)
  optional(@Uid() uid: number) {
    return { uid };
  }

  @Get('required')
  @UseGuards(AuthRequiredGuard)
  required(@Uid() uid: number) {
    return { uid };
  }

  @Get('with-user')
  @UseGuards(AuthRequiredGuard, WithUserGuard)
  withUser(@WithUser() user: User | null) {
    return {
      id: user?.id ?? null,
      username: user?.username ?? null,
      // Proves the eager photo relation survives the guard path.
      photoId: user?.photoId ?? null,
      photoLoaded: user?.photo != null,
    };
  }
}

@Module({ imports: [AppModule], controllers: [AuthCheckController] })
class AuthCheckModule {}

/** `Response.json()` is typed `unknown`; these checks only read known fields. */
const json = async <T = Record<string, any>>(response: Response): Promise<T> =>
  (await response.json()) as T;

let failures = 0;

function check(label: string, condition: boolean, detail?: unknown) {
  if (condition) {
    console.log(`  ✓ ${label}`);
    return;
  }
  failures += 1;
  console.log(`  ✗ ${label}${detail === undefined ? '' : ` — ${JSON.stringify(detail)}`}`);
}

async function main() {
  const secret = getJwtSecret();

  if (!secret) {
    console.error('JWT_SECRET is not set — set it in .env.local before running this check');
    process.exit(1);
  }

  // Pick a real user (with an avatar, so the eager relation is exercised).
  await dataSource.initialize();
  const subject = await dataSource
    .getRepository(User)
    .createQueryBuilder('user')
    .where('user.photoId IS NOT NULL AND user.deleted_at IS NULL')
    .orderBy('user.id', 'ASC')
    .getOne();
  await dataSource.destroy();

  if (!subject) {
    console.error('no user with a photo found in the database — is the dump loaded?');
    process.exit(1);
  }

  /**
   * `iat` in seconds, no `exp`, no other registered claims.
   *
   * Never pass `noTimestamp` when signing: it strips the `iat` already in the
   * payload rather than just suppressing an added one, producing a token with no
   * `iat` at all.
   */
  const claims: ITokenClaims = {
    uid: subject.id,
    nme: subject.username,
    rol: subject.role,
    iat: Math.floor(Date.now() / 1000),
  };

  const token = jwt.sign(claims, secret, { algorithm: 'HS256' });
  const decoded = jwt.decode(token) as Record<string, unknown>;

  console.log('\nhand-crafted token');
  console.log(`  ${token.slice(0, 48)}…`);
  check('carries exactly the expected claim set', Object.keys(decoded).sort().join(',') === 'iat,nme,rol,uid', Object.keys(decoded));
  check('has no exp claim', decoded.exp === undefined);

  const app = await NestFactory.create<NestExpressApplication>(AuthCheckModule, {
    cors: CORS_OPTIONS,
    // Keep startup errors visible; silencing the logger hides them entirely.
    logger: ['error', 'warn'],
    abortOnError: false,
  });
  app.useGlobalFilters(new VaultExceptionFilter());
  app.setGlobalPrefix('api');
  await app.listen(0);

  const base = (await app.getUrl()).replace('[::1]', '127.0.0.1');
  const authed = { Authorization: `Bearer ${token}` };

  try {
    console.log('\noptional auth (never rejects)');
    const guestOptional = await fetch(`${base}/api/__authcheck/optional`);
    check('guest gets 200', guestOptional.status === 200, guestOptional.status);
    check('guest uid is 0', (await json(guestOptional)).uid === 0);

    const authedOptional = await fetch(`${base}/api/__authcheck/optional`, { headers: authed });
    check('token resolves to the right uid', (await json(authedOptional)).uid === subject.id);

    const badOptional = await fetch(`${base}/api/__authcheck/optional`, {
      headers: { Authorization: 'Bearer not-a-token' },
    });
    check('a garbage token degrades to guest, not an error', badOptional.status === 200);
    check('…with uid 0', (await json(badOptional)).uid === 0);

    console.log('\nrequired auth');
    const guestRequired = await fetch(`${base}/api/__authcheck/required`);
    check('guest gets 401', guestRequired.status === 401, guestRequired.status);
    const errorBody = await json(guestRequired);
    check(
      'in the frozen error envelope',
      errorBody.error === 'NotAuthorized' && typeof errorBody.message === 'string',
      errorBody,
    );

    const okRequired = await fetch(`${base}/api/__authcheck/required`, { headers: authed });
    check('hand-crafted legacy token is accepted', okRequired.status === 200, okRequired.status);

    // A token signed with the wrong key must not pass.
    const forged = jwt.sign(claims, `${secret}-wrong`, { algorithm: 'HS256' });
    const forgedResponse = await fetch(`${base}/api/__authcheck/required`, {
      headers: { Authorization: `Bearer ${forged}` },
    });
    check('a token signed with the wrong secret is rejected', forgedResponse.status === 401, forgedResponse.status);

    console.log('\nWithUser (eager photo)');
    const withUser = await fetch(`${base}/api/__authcheck/with-user`, { headers: authed });
    const body = await json(withUser);
    check('loads the full user row', body.id === subject.id && body.username === subject.username, body);
    check('eager photo relation is populated', body.photoLoaded === true, body);

    console.log('\nCORS');
    const preflight = await fetch(`${base}/api/__authcheck/optional`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://vault48.org',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'authorization,cache-control',
      },
    });
    check('preflight answers 200', preflight.status === 200, preflight.status);
    check('allows any origin', preflight.headers.get('access-control-allow-origin') === '*');
    const allowHeaders = (preflight.headers.get('access-control-allow-headers') ?? '').toLowerCase();
    check('allows Authorization', allowHeaders.includes('authorization'), allowHeaders);
    check('allows Cache-Control', allowHeaders.includes('cache-control'), allowHeaders);

    console.log(failures === 0 ? '\n✓ all auth checks passed' : `\n✗ ${failures} auth check(s) failed`);
    if (failures > 0) {
      process.exitCode = 1;
    }
  } finally {
    await app.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
