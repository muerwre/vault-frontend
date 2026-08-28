import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Comment } from '../../entities/comment.entity';
import { File } from '../../entities/file.entity';
import { Node } from '../../entities/node.entity';
import { User } from '../../entities/user.entity';

import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [TypeOrmModule.forFeature([Node, Comment, File, User])],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
