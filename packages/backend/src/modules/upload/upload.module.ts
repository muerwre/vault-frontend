import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { File } from '../../entities/file.entity';

import { StaticController } from './static.controller';
import { StaticService } from './static.service';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  imports: [TypeOrmModule.forFeature([File])],
  controllers: [UploadController, StaticController],
  providers: [UploadService, StaticService],
  exports: [UploadService],
})
export class UploadModule {}
