import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  MEDIA_SHA256_HEADER,
  type MediaClaimedJob,
  type MediaClaimRequest,
  type MediaCompleteRequest,
  type MediaFailRequest,
  type MediaProgressRequest,
  type MediaSkipRequest,
} from '@vault/common/media';
import type { Request, Response } from 'express';

import { Fetcher, FetcherKeyGuard } from './fetcher-key.guard';
import { MediaJobsService } from './media-jobs.service';

/** The media fetcher's side of the job queue. Fetcher keys only. */
@Controller('internal/media')
@UseGuards(FetcherKeyGuard)
export class MediaJobsController {
  constructor(private readonly jobs: MediaJobsService) {}

  /** The most urgent job of the requested kinds, or 204 when there is none. */
  @Post('jobs/claim')
  @HttpCode(HttpStatus.OK)
  async claim(
    @Fetcher() fetcher: string,
    @Body() body: MediaClaimRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<MediaClaimedJob | undefined> {
    const job = await this.jobs.claim(fetcher, body);

    if (!job) {
      response.status(HttpStatus.NO_CONTENT);
      return undefined;
    }

    return job;
  }

  @Post('jobs/:id/progress')
  @HttpCode(HttpStatus.NO_CONTENT)
  progress(
    @Fetcher() fetcher: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: MediaProgressRequest,
  ): Promise<void> {
    return this.jobs.progress(fetcher, id, body);
  }

  /** The raw file as the body, its SHA-256 in a header. */
  @Put('jobs/:id/files/:slot')
  @HttpCode(HttpStatus.NO_CONTENT)
  upload(
    @Fetcher() fetcher: string,
    @Param('id', ParseIntPipe) id: number,
    @Param('slot') slot: string,
    @Req() request: Request,
  ): Promise<void> {
    return this.jobs.upload(fetcher, id, slot, request, {
      contentType: request.headers['content-type'],
      contentLength: request.headers['content-length'],
      sha256: request.header(MEDIA_SHA256_HEADER),
    });
  }

  @Post('jobs/:id/complete')
  @HttpCode(HttpStatus.NO_CONTENT)
  complete(
    @Fetcher() fetcher: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: MediaCompleteRequest,
  ): Promise<void> {
    return this.jobs.complete(fetcher, id, body);
  }

  @Post('jobs/:id/fail')
  @HttpCode(HttpStatus.NO_CONTENT)
  fail(
    @Fetcher() fetcher: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: MediaFailRequest,
  ): Promise<void> {
    return this.jobs.fail(fetcher, id, body);
  }

  @Post('jobs/:id/skip')
  @HttpCode(HttpStatus.NO_CONTENT)
  skip(
    @Fetcher() fetcher: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: MediaSkipRequest,
  ): Promise<void> {
    return this.jobs.skip(fetcher, id, body);
  }
}
