import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Embed } from '../../entities/embed.entity';

import { MetaController } from './meta.controller';
import { MetaService } from './meta.service';
import { YoutubeService } from './youtube.service';

@Module({
  imports: [TypeOrmModule.forFeature([Embed])],
  controllers: [MetaController],
  providers: [MetaService, YoutubeService],
})
export class MetaModule {}
