import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Comment } from '../../entities/comment.entity';
import { File } from '../../entities/file.entity';
import { Like } from '../../entities/like.entity';
import { NodeSocialPublication } from '../../entities/node-extras.entity';
import { Node } from '../../entities/node.entity';
import { Tag } from '../../entities/tag.entity';
import { NodeView } from '../../entities/views.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { TagModule } from '../tag/tag.module';

import { LabService } from './lab.service';
import { NodeTagsService } from './node-tags.service';
import { NodeUpsertService } from './node-upsert.service';
import { NodeController } from './node.controller';
import { NodeService } from './node.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Node,
      File,
      Like,
      NodeView,
      NodeSocialPublication,
      Tag,
      Comment,
    ]),
    TagModule,
    NotificationsModule,
  ],
  controllers: [NodeController],
  providers: [NodeService, NodeTagsService, NodeUpsertService, LabService],
  exports: [NodeService],
})
export class NodeModule {}
