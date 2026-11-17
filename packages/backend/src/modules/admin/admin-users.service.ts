import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { User } from '../../entities/user.entity';
import { toWireUser, type WireUser } from '../../wire/serialize';

/** Users as the admin page lists them. */
@Injectable()
export class AdminUsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  /**
   * Every user not deleted, most recently seen first; those never seen come
   * last. `find` rather than a query builder, so the photo comes along.
   */
  async list(): Promise<WireUser[]> {
    const users = await this.users.find({ where: { deletedAt: IsNull() } });

    const seen = (user: User) => user.lastSeen?.getTime() ?? -Infinity;

    return users
      .sort((a, b) => seen(b) - seen(a) || a.id - b.id)
      .map((user) => toWireUser(user) as WireUser);
  }
}
