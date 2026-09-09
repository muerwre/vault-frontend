import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { File } from '../../entities/file.entity';
import { Like } from '../../entities/like.entity';
import { NodeSocialPublication } from '../../entities/node-extras.entity';
import { Node } from '../../entities/node.entity';
import { Tag } from '../../entities/tag.entity';
import { NodeView } from '../../entities/views.entity';

import { TagModule } from '../tag/tag.module';

import { NodeTagsService } from './node-tags.service';
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
    ]),
    TagModule,
  ],
  controllers: [NodeController],
  providers: [NodeService, NodeTagsService],
  exports: [NodeService],
})
export class NodeModule {}
