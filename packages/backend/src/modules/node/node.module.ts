import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { File } from '../../entities/file.entity';
import { Like } from '../../entities/like.entity';
import { NodeSocialPublication } from '../../entities/node-extras.entity';
import { Node } from '../../entities/node.entity';
import { NodeView } from '../../entities/views.entity';

import { NodeController } from './node.controller';
import { NodeService } from './node.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Node, File, Like, NodeView, NodeSocialPublication]),
  ],
  controllers: [NodeController],
  providers: [NodeService],
})
export class NodeModule {}
