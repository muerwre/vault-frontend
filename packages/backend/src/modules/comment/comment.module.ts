import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Comment } from '../../entities/comment.entity';
import { File } from '../../entities/file.entity';
import { CommentUserLike } from '../../entities/like.entity';
import { Node } from '../../entities/node.entity';
import { MediaModule } from '../media/media.module';
import { NodeModule } from '../node/node.module';
import { NotificationsModule } from '../notifications/notifications.module';

import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, File, CommentUserLike, Node]),
    NodeModule,
    MediaModule,
    NotificationsModule,
  ],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
