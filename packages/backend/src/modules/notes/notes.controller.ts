import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ERROR_CODES } from '@vault/common/constants';

import { VaultException } from '../../globals/exceptions';
import { AuthRequiredGuard, Uid } from '../auth/auth.guards';

import {
  NotesService,
  normaliseNotesQuery,
  type WireNotesList,
  type WireNoteWithoutUser,
} from './notes.service';

/** Clients call `/notes/` with a trailing slash; loose routing serves both. */
@Controller('notes')
@UseGuards(AuthRequiredGuard)
export class NotesController {
  constructor(private readonly notes: NotesService) {}

  @Get()
  getList(
    @Uid() uid: number,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('search') search?: string,
  ): Promise<WireNotesList> {
    const query = normaliseNotesQuery({ limit, offset, search });

    return this.notes.getList(uid, query.limit, query.offset, query.search);
  }

  /** Empty text is refused with the field-keyed validation envelope. */
  @Post()
  @HttpCode(HttpStatus.OK)
  async create(
    @Uid() uid: number,
    @Body() body: { text?: string },
  ): Promise<WireNoteWithoutUser> {
    const text = (body?.text ?? '').trim();

    if (!text) {
      throw new VaultException(
        ERROR_CODES.IncorrectData,
        HttpStatus.BAD_REQUEST,
        'Заметка не может быть пустой',
      );
    }

    return this.notes.toWireWithoutUser(await this.notes.create(uid, text));
  }

  /** Reads `content`, not `text`. */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Uid() uid: number,
    @Body() body: { content?: string },
  ): Promise<WireNoteWithoutUser> {
    const note = await this.requireOwn(id, uid);
    const content = (body?.content ?? '').trim();

    if (!content) {
      throw new VaultException(
        ERROR_CODES.IncorrectData,
        HttpStatus.BAD_REQUEST,
        'Заметка не может быть пустой',
      );
    }

    return this.notes.toWireWithoutUser(await this.notes.update(note, content));
  }

  /** Answers 200 with an empty body. */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @Uid() uid: number): Promise<void> {
    const note = await this.requireOwn(id, uid);

    await this.notes.remove(note.id);
  }

  /**
   * Someone else's note is reported as missing rather than forbidden, so the
   * endpoint does not disclose which ids exist.
   */
  private async requireOwn(id: string, uid: number) {
    const parsed = Number.parseInt(id, 10);
    const note =
      Number.isFinite(parsed) && parsed > 0
        ? await this.notes.findById(parsed)
        : null;

    if (!note || note.fromId !== uid) {
      throw new VaultException(ERROR_CODES.NoteNotFound, HttpStatus.NOT_FOUND);
    }

    return note;
  }
}
