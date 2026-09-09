import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Message } from '../../entities/message.entity';
import { toWireDate, toWireString } from '../../wire/serialize';

/**
 * A note is a **self-message**: a `message` row whose `fromId` and `toId` are
 * both the author. There is no `note` table, and `content` maps onto
 * `message.text`.
 */
export interface WireNote {
  id: number;
  user_id: number;
  content: string;
  created_at: string;
}

/** The created/updated shapes omit `user_id`; only the list carries it. */
export type WireNoteWithoutUser = Omit<WireNote, 'user_id'>;

export interface WireNotesList {
  list: WireNote[];
  /** Clients read `totalCount`. */
  totalCount: number;
}

export const NOTES_DEFAULT_LIMIT = 100;
export const NOTES_MAX_LIMIT = 100;

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Message) private readonly messages: Repository<Message>,
  ) {}

  /**
   * A user's notes, newest first. Empty-text rows are excluded, matching how the
   * list has always been filtered.
   */
  async getList(
    userId: number,
    limit: number,
    offset: number,
    search: string,
  ): Promise<WireNotesList> {
    const build = () => {
      const query = this.messages
        .createQueryBuilder('message')
        .where('message.fromId = :userId AND message.toId = :userId', { userId })
        .andWhere("message.text <> ''")
        .andWhere('message.deleted_at IS NULL');

      if (search) {
        query.andWhere("message.text LIKE CONCAT('%', :search, '%')", { search });
      }

      return query;
    };

    const totalCount = await build().getCount();

    const rows = await build()
      .orderBy('message.created_at', 'DESC')
      // `created_at` has second precision, so notes written in the same second
      // would otherwise come back in an arbitrary, unstable order.
      .addOrderBy('message.id', 'DESC')
      .limit(limit)
      .offset(offset)
      .getMany();

    return { totalCount, list: rows.map(row => this.toWire(row)) };
  }

  /** Resolves a note only if it is genuinely a self-message. */
  async findById(id: number): Promise<Message | null> {
    return this.messages
      .createQueryBuilder('message')
      .where('message.id = :id', { id })
      .andWhere('message.fromId = message.toId')
      .andWhere('message.deleted_at IS NULL')
      .getOne();
  }

  async create(userId: number, text: string): Promise<Message> {
    return this.messages.save(
      this.messages.create({
        text,
        fromId: userId,
        toId: userId,
        filesOrder: [],
      }),
    );
  }

  /** Only the text is mutable; authorship and creation time are fixed. */
  async update(note: Message, content: string): Promise<Message> {
    await this.messages.update(note.id, { text: content });
    note.text = content;

    return note;
  }

  /** Soft delete, so the row survives for auditing. */
  async remove(id: number): Promise<void> {
    await this.messages.update(id, { deletedAt: new Date() });
  }

  toWire(note: Message): WireNote {
    return {
      id: note.id,
      user_id: note.fromId ?? 0,
      content: toWireString(note.text),
      created_at: toWireDate(note.createdAt),
    };
  }

  toWireWithoutUser(note: Message): WireNoteWithoutUser {
    const { user_id: _ignored, ...rest } = this.toWire(note);

    return rest;
  }
}

/** Clamps paging. Absent or unusable values fall back to the defaults. */
export const normaliseNotesQuery = (raw: {
  limit?: string;
  offset?: string;
  search?: string;
}): { limit: number; offset: number; search: string } => {
  const limit = Number.parseInt(raw.limit ?? '', 10);
  const offset = Number.parseInt(raw.offset ?? '', 10);

  return {
    limit:
      Number.isFinite(limit) && limit > 0 && limit <= NOTES_MAX_LIMIT
        ? limit
        : NOTES_DEFAULT_LIMIT,
    offset: Number.isFinite(offset) && offset > 0 ? offset : 0,
    search: (raw.search ?? '').trim(),
  };
};
