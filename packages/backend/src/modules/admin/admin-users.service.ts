import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ERROR_CODES, ROLES } from '@vault/common/constants';
import { In, IsNull, Repository } from 'typeorm';

import { Social } from '../../entities/social.entity';
import { User } from '../../entities/user.entity';
import { VaultException } from '../../globals/exceptions';
import { toWireUser, type WireUser } from '../../wire/serialize';
import { TokenReader } from '../auth/auth.guards';

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
    private readonly tokens: TokenReader,
  ) {}

  /**
   * Soft-deletes a user: sets `deleted_at`, which ends their sessions and
   * logins (tokens of a deleted account are refused) while their posts and
   * comments stay. An admin cannot delete themselves or another admin.
   */
  async softDelete(id: number, adminId: number): Promise<void> {
    const user = await this.users.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!user) {
      throw new VaultException(ERROR_CODES.UserNotFound, HttpStatus.NOT_FOUND);
    }

    if (user.id === adminId) {
      throw new VaultException(
        ERROR_CODES.NotEnoughRights,
        HttpStatus.BAD_REQUEST,
        'Нельзя удалить самого себя',
      );
    }

    if (user.role === ROLES.ADMIN) {
      throw new VaultException(
        ERROR_CODES.NotEnoughRights,
        HttpStatus.BAD_REQUEST,
        'Нельзя удалить администратора',
      );
    }

    await this.users.update(user.id, { deletedAt: () => 'NOW()' });
    this.tokens.forget(user.id);
  }

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
