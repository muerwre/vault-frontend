import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Comment } from '../../entities/comment.entity';
import { File } from '../../entities/file.entity';
import { ExternalMedia, MediaJob } from '../../entities/media.entity';
import { Node } from '../../entities/node.entity';
import { UploadModule } from '../upload/upload.module';

import { MediaAdminController } from './media-admin.controller';
import { MediaAdminService } from './media-admin.service';
import { MediaBackfillService } from './media-backfill.service';
import { MediaCleanupService } from './media-cleanup.service';
import { MediaJobsController } from './media-jobs.controller';
import { MediaJobsService } from './media-jobs.service';
import { MediaPlannerService } from './media-planner.service';
import { MediaRefsService } from './media-refs.service';
import { MediaSourceService } from './media-source.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExternalMedia, MediaJob, Node, Comment, File]),
    UploadModule,
  ],
  controllers: [MediaJobsController, MediaAdminController],
  providers: [
    MediaRefsService,
    MediaPlannerService,
    MediaBackfillService,
    MediaJobsService,
    MediaCleanupService,
    MediaAdminService,
    MediaSourceService,
  ],
  exports: [MediaRefsService],
})
export class MediaModule {}
