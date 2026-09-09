import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ERROR_CODES } from '@vault/common/constants';

import { User } from '../../entities/user.entity';
import { VaultException } from '../../globals/exceptions';
import { AuthRequiredGuard, WithUser, WithUserGuard } from '../auth/auth.guards';
import type { WireShallowFile } from '../../wire/serialize';

import {
  isMimeAllowedForType,
  isUploadTargetAllowed,
  isUploadTypeAllowed,
} from './upload.paths';
import { UploadService } from './upload.service';

/** The multipart field is named `file`. */
const FIELD = 'file';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploads: UploadService) {}

  /**
   * Answers **201** with the shallow file shape.
   *
   * The size limit is enforced here rather than by multer so the refusal carries
   * the `File_Is_Too_Big` code instead of a generic 413.
   */
  @Post(':target/:type')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthRequiredGuard, WithUserGuard)
  @UseInterceptors(FileInterceptor(FIELD))
  async upload(
    @Param('target') target: string,
    @Param('type') type: string,
    @WithUser() user: User,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<WireShallowFile> {
    if (!isUploadTargetAllowed(target) || !isUploadTypeAllowed(type)) {
      throw new VaultException(
        ERROR_CODES.IncorrectData,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!file || !file.buffer?.length) {
      throw new VaultException(
        ERROR_CODES.FilesRequired,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (file.size > this.uploads.maxSizeBytes) {
      throw new VaultException(
        ERROR_CODES.FilesIsTooBig,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!isMimeAllowedForType(type, file.mimetype)) {
      throw new VaultException(
        ERROR_CODES.UnknownFileType,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.uploads.store(
      file.buffer,
      file.originalname,
      file.mimetype,
      type,
      target,
      user,
    );
  }
}
