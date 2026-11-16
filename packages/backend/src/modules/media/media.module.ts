import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Comment } from '../../entities/comment.entity';
import { File } from '../../entities/file.entity';
import { ExternalMedia, MediaJob } from '../../entities/media.entity';
import { Node } from '../../entities/node.entity';
import { MetaModule } from '../meta/meta.module';
import { UploadModule } from '../upload/upload.module';

import { MediaBackfillService } from './media-backfill.service';
import { MediaJobsController } from './media-jobs.controller';
import { MediaJobsService } from './media-jobs.service';
import { MediaPlannerService } from './media-planner.service';
import { MediaRefsService } from './media-refs.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExternalMedia, MediaJob, Node, Comment, File]),
    MetaModule,
    UploadModule,
  ],
  controllers: [MediaJobsController],
  providers: [
    MediaRefsService,
    MediaPlannerService,
    MediaBackfillService,
    MediaJobsService,
  ],
  exports: [MediaRefsService],
})
export class MediaModule {}
