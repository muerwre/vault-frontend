import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';

import { Social } from '../../entities/social.entity';
import { User } from '../../entities/user.entity';
import { toWireUser, type WireUser } from '../../wire/serialize';

/** An external account a user can sign in with. */
export interface WireLinkedAccount {
  /** `vkontakte`, `google` or `telegram`. */
  provider: string;
  /** The provider's id: a number for VK and Telegram, an email for Google. */
  account_id: string;
}

export interface WireAdminUser extends WireUser {
  /**
   * Accounts linked now. When an account was linked is not recorded, so this
   * says how a user can sign in, not how they registered.
   */
  accounts: WireLinkedAccount[];
}

/** Users as the admin page lists them. */
@Injectable()
export class AdminUsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Social) private readonly socials: Repository<Social>,
  ) {}

  /**
   * Every user not deleted, most recently seen first; those never seen come
   * last. `find` rather than a query builder, so the photo comes along.
   */
  async list(): Promise<WireAdminUser[]> {
    const users = await this.users.find({ where: { deletedAt: IsNull() } });
    const accounts = await this.accountsOf(users.map((user) => user.id));

    const seen = (user: User) => user.lastSeen?.getTime() ?? -Infinity;

    return users
      .sort((a, b) => seen(b) - seen(a) || a.id - b.id)
      .map((user) => ({
        ...(toWireUser(user) as WireUser),
        accounts: accounts.get(user.id) ?? [],
      }));
  }

  private async accountsOf(
    userIds: number[],
  ): Promise<Map<number, WireLinkedAccount[]>> {
    const byUser = new Map<number, WireLinkedAccount[]>();

    if (userIds.length === 0) {
      return byUser;
    }

    const rows = await this.socials.find({
      where: { userId: In(userIds) },
      order: { id: 'ASC' },
    });

    for (const row of rows) {
      const list = byUser.get(row.userId ?? 0) ?? [];
      list.push({
        provider: row.provider,
        account_id: row.accountId,
      });
      byUser.set(row.userId ?? 0, list);
    }

    return byUser;
  }
}
