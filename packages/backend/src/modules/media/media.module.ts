import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Comment } from '../../entities/comment.entity';
import { ExternalMedia, MediaJob } from '../../entities/media.entity';
import { Node } from '../../entities/node.entity';
import { MetaModule } from '../meta/meta.module';
import { UploadModule } from '../upload/upload.module';

import { MediaBackfillService } from './media-backfill.service';
import { MediaPlannerService } from './media-planner.service';
import { MediaRefsService } from './media-refs.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExternalMedia, MediaJob, Node, Comment]),
    MetaModule,
    UploadModule,
  ],
  providers: [MediaRefsService, MediaPlannerService, MediaBackfillService],
  exports: [MediaRefsService],
})
export class MediaModule {}
