import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Node } from '../../entities/node.entity';

import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [TypeOrmModule.forFeature([Node])],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
