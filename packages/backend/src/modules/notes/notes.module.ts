import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Message } from '../../entities/message.entity';

import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  controllers: [NotesController],
  providers: [NotesService],
})
export class NotesModule {}
