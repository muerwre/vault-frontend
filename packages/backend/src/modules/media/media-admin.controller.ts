import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type {
  IMediaAdminJobList,
  IMediaAdminSummary,
} from '@vault/common/media';

import {
  AdminOnlyGuard,
  MembersOnlyGuard,
  WithUserGuard,
} from '../auth/auth.guards';

import { MediaAdminService } from './media-admin.service';

/** The media cache's admin page. Anyone but an admin gets a 404. */
@Controller('admin/media')
@UseGuards(MembersOnlyGuard, WithUserGuard, AdminOnlyGuard)
export class MediaAdminController {
  constructor(private readonly admin: MediaAdminService) {}

  @Get('summary')
  summary(): Promise<IMediaAdminSummary> {
    return this.admin.summary();
  }

  /** `status` is one of `MEDIA_ADMIN_JOB_FILTERS`; the queue by default. */
  @Get('jobs')
  jobs(
    @Query('status') status?: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ): Promise<IMediaAdminJobList> {
    return this.admin.listJobs(status, Number(take), Number(skip));
  }

  @Post('jobs/:id/retry')
  @HttpCode(HttpStatus.NO_CONTENT)
  retry(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.admin.retry(id);
  }

  /** Releases a backlog item now; `id` is the item's. */
  @Post('items/:id/release')
  @HttpCode(HttpStatus.NO_CONTENT)
  release(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.admin.release(id);
  }

  /** Stops keeping an item's video; `id` is the item's. */
  @Post('items/:id/skip')
  @HttpCode(HttpStatus.NO_CONTENT)
  skip(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.admin.skip(id);
  }

  /** Queues a skipped item's video again; `id` is the item's. */
  @Post('items/:id/unskip')
  @HttpCode(HttpStatus.NO_CONTENT)
  unskip(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.admin.unskip(id);
  }
}
