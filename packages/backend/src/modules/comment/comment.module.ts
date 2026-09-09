import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Comment } from '../../entities/comment.entity';
import { File } from '../../entities/file.entity';
import { CommentUserLike } from '../../entities/like.entity';

import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, File, CommentUserLike])],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
