import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import { FILE_TYPES, GUEST_USER_ID } from '@vault/common/constants';
import { map, type Observable } from 'rxjs';

import type { AuthedRequest } from '../modules/auth/auth.guards';

/**
 * Songs are for members: a guest gets every audio file without the address
 * to play it from. Applied to whole responses, so a file is covered wherever
 * it sits (a node's files, a text node's blocks, a flow cell, a comment).
 */

const isPlain = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const proto = Object.getPrototypeOf(value);

  return proto === Object.prototype || proto === null;
};

/** A file on the wire: typed, with an address and a mime. */
const isAudioFile = (value: Record<string, unknown>): boolean =>
  value.type === FILE_TYPES.AUDIO && 'url' in value && 'mime' in value;

/**
 * The value with every audio file's `url` and `path` emptied. Copies only what
 * changes: responses may hold objects a service keeps between requests, and a
 * guest's copy must never reach a member.
 */
export const stripAudioUrls = <T>(value: T): T => {
  if (Array.isArray(value)) {
    let changed = false;

    const next = value.map((item) => {
      const stripped = stripAudioUrls(item);
      changed ||= stripped !== item;
      return stripped;
    });

    return (changed ? next : value) as T;
  }

  if (!isPlain(value)) {
    return value;
  }

  let next: Record<string, unknown> | null = null;

  for (const [key, item] of Object.entries(value)) {
    const stripped = stripAudioUrls(item);

    if (stripped !== item) {
      next ??= { ...value };
      next[key] = stripped;
    }
  }

  if (isAudioFile(value)) {
    next ??= { ...value };
    next.url = '';

    if ('path' in next) {
      next.path = '';
    }
  }

  return (next ?? value) as T;
};

@Injectable()
export class GuestAudioInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<AuthedRequest>();

    // routes without an auth guard know nobody, so they count as a guest
    const isGuest = (request.auth?.uid ?? GUEST_USER_ID) === GUEST_USER_ID;

    return isGuest ? next.handle().pipe(map(stripAudioUrls)) : next.handle();
  }
}
