import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { ERROR_CODES, GUEST_USER_ID, ROLES } from '@vault/common/constants';
import type { ITokenClaims } from '@vault/common/types';
import type { Request } from 'express';
import { Repository } from 'typeorm';

import { User } from '../../entities/user.entity';
import { VaultException } from '../../globals/exceptions';

/** What the guards attach to the request. */
export interface AuthContext {
  claims: ITokenClaims | null;
  /** `0` for a guest. */
  uid: number;
  user: User | null;
}

/** Widened Request carrying the auth context the guards populate. */
export type AuthedRequest = Request & { auth?: AuthContext };

const GUEST_CONTEXT: AuthContext = {
  claims: null,
  uid: GUEST_USER_ID,
  user: null,
};

const extractToken = (request: Request): string | null => {
  const header = request.headers.authorization;

  if (!header) {
    return null;
  }

  // Accept a bare token as well as `Bearer <token>`; older clients send both.
  const [scheme, value] = header.split(' ');

  if (value === undefined) {
    return scheme || null;
  }

  return scheme.toLowerCase() === 'bearer' ? value : null;
};

@Injectable()
class TokenReader {
  private readonly logger = new Logger('Auth');

  constructor(private readonly jwt: JwtService) {}

  /** Returns the claims, or `null` if the token is absent or unusable. */
  read(request: Request): ITokenClaims | null {
    const token = extractToken(request);

    if (!token) {
      return null;
    }

    try {
      return this.jwt.verify<ITokenClaims>(token);
    } catch (error) {
      // Not an error on optional routes, so debug-level only.
      this.logger.debug(
        `rejected token: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }
}

/**
 * Never rejects: populates `request.auth` with the token's claims, or the guest
 * context. Used by read endpoints so one route serves both guests and users.
 */
@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private readonly tokens: TokenReader) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthedRequest>();
    const claims = this.tokens.read(request);

    request.auth = claims
      ? { claims, uid: claims.uid, user: null }
      : { ...GUEST_CONTEXT };

    return true;
  }
}

/**
 * Requires a valid token, else 401. A 401 makes clients drop their session, so
 * this guard should be the only source of one.
 */
@Injectable()
export class AuthRequiredGuard implements CanActivate {
  constructor(private readonly tokens: TokenReader) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthedRequest>();
    const claims = this.tokens.read(request);

    if (!claims) {
      throw new VaultException(
        ERROR_CODES.NotAuthorized,
        HttpStatus.UNAUTHORIZED,
      );
    }

    request.auth = { claims, uid: claims.uid, user: null };

    return true;
  }
}

/**
 * Loads the full `User` (with photo and cover) onto `request.auth.user`.
 *
 * Separate from `AuthRequiredGuard` so routes needing only `uid` do not pay for
 * the join. Use **after** an auth guard:
 * `@UseGuards(AuthRequiredGuard, WithUserGuard)`.
 */
@Injectable()
export class WithUserGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthedRequest>();
    const uid = request.auth?.uid ?? GUEST_USER_ID;

    if (!request.auth) {
      throw new Error(
        'WithUserGuard requires an auth guard to run first (OptionalAuthGuard or AuthRequiredGuard)',
      );
    }

    if (uid === GUEST_USER_ID) {
      return true;
    }

    // `find*` honours the eager photo/cover relations; QueryBuilder would not.
    const user = await this.users.findOne({ where: { id: uid } });

    // A token for a deleted account is not a valid session.
    if (!user) {
      throw new VaultException(
        ERROR_CODES.NotAuthorized,
        HttpStatus.UNAUTHORIZED,
      );
    }

    request.auth.user = user;

    return true;
  }
}

/** Injects the resolved `User`, or `null` for a guest. */
export const WithUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): User | null =>
    context.switchToHttp().getRequest<AuthedRequest>().auth?.user ?? null,
);

/** Injects the authenticated user id (`0` for a guest). */
export const Uid = createParamDecorator(
  (_data: unknown, context: ExecutionContext): number =>
    context.switchToHttp().getRequest<AuthedRequest>().auth?.uid ??
    GUEST_USER_ID,
);

/** Injects the raw token claims, or `null`. */
export const Claims = createParamDecorator(
  (_data: unknown, context: ExecutionContext): ITokenClaims | null =>
    context.switchToHttp().getRequest<AuthedRequest>().auth?.claims ?? null,
);

/** The identity served for an unauthenticated caller. */
export const GUEST_USER = { id: GUEST_USER_ID, role: ROLES.GUEST } as const;

export { TokenReader };
