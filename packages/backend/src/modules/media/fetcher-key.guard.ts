import {
  type CanActivate,
  createParamDecorator,
  type ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ERROR_CODES } from '@vault/common/constants';
import type { Request } from 'express';

import { getMediaFetcherKeys } from '../../config/env';
import { VaultException } from '../../globals/exceptions';

import {
  bearerSecret,
  matchFetcherKey,
  parseFetcherKeys,
} from './fetcher-keys';
import { MediaJobsService } from './media-jobs.service';

interface FetcherRequest extends Request {
  fetcher?: string;
}

/**
 * Admits only requests carrying a configured fetcher key, and notes each
 * admitted fetcher as heard from.
 */
@Injectable()
export class FetcherKeyGuard implements CanActivate {
  constructor(private readonly jobs: MediaJobsService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FetcherRequest>();
    const name = matchFetcherKey(
      parseFetcherKeys(getMediaFetcherKeys()),
      bearerSecret(request.headers.authorization),
    );

    if (!name) {
      throw new VaultException(
        ERROR_CODES.NotAuthorized,
        HttpStatus.UNAUTHORIZED,
      );
    }

    request.fetcher = name;
    this.jobs.noteSeen(name);

    return true;
  }
}

/** The name of the fetcher {@link FetcherKeyGuard} admitted. */
export const Fetcher = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string =>
    context.switchToHttp().getRequest<FetcherRequest>().fetcher ?? '',
);
