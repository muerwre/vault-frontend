import { Controller, Get, HttpStatus, Req, Res } from '@nestjs/common';
import { ERROR_CODES } from '@vault/common/constants';
import type { Request, Response } from 'express';

import { VaultException } from '../../globals/exceptions';

import { StaticService } from './static.service';
import { parseCacheRequest } from './upload.paths';

/** Six months, matching how long generated variants are considered fresh. */
const CACHE_MAX_AGE = 15552000;

@Controller('static')
export class StaticController {
  constructor(private readonly statics: StaticService) {}

  /**
   * Serves uploads, generating scaled variants on demand for
   * `/static/cache/<preset>/<src>`.
   *
   * Paths are resolved against the uploads root and anything escaping it is a
   * 404, so `..` cannot reach the rest of the filesystem.
   */
  @Get('*path')
  async serve(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    const relative = decodeURIComponent(
      request.path
        .replace(/^\/api\/static\/?/, '')
        .replace(/^\/?static\/?/, ''),
    );

    if (!relative) {
      throw new VaultException(ERROR_CODES.EmptyRequest, HttpStatus.NOT_FOUND);
    }

    const cacheRequest = parseCacheRequest(relative);

    if (cacheRequest) {
      const variant = await this.statics.resolveScaled(
        cacheRequest.preset,
        cacheRequest.src,
      );

      if (!variant) {
        throw new VaultException(
          ERROR_CODES.EmptyRequest,
          HttpStatus.NOT_FOUND,
        );
      }

      response.setHeader(
        'Cache-Control',
        `public, max-age=${CACHE_MAX_AGE}, immutable`,
      );
      response.sendFile(variant.absolutePath);
      return;
    }

    const absolute = await this.statics.resolvePlain(relative);

    if (!absolute) {
      throw new VaultException(ERROR_CODES.EmptyRequest, HttpStatus.NOT_FOUND);
    }

    response.setHeader('Cache-Control', `public, max-age=${CACHE_MAX_AGE}`);
    response.sendFile(absolute);
  }
}
