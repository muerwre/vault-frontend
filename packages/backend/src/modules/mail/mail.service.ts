import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

import {
  getFrontendResetUrl,
  publicUrl,
  getSmtpConfig,
} from '../../config/env';

/** `{link}` is replaced with the reset link, `{username}` with the account name. */
const RESTORE_SUBJECT = 'Кто-то пытается сбросить пароль!';
const RESTORE_TEXT =
  'Привет, {username}!\n\n' +
  'Кто-то (или что-то) попросило нас сбросить ваш пароль. \n\n' +
  'Если это что-то вы, то просто перейдите по ссылке и выберите новый пароль. \n\n' +
  'Или не делайте ничего. Зачем? Почему?\n\n' +
  'А! Ссылка: {link}';
const RESTORE_HTML =
  '<p>Привет, <b>{username}</b>!</p>' +
  '<h4>Кто-то (или что-то) попросило нас сбросить ваш пароль</h4>' +
  '<p>Если это что-то вы, то просто перейдите по ссылке и выберите новый пароль.</p>' +
  '<p>Или не делайте ничего. Зачем? Почему?</p>' +
  '<p>А! Ссылка: <a href="{link}">сбросить пароль</a>';

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

/**
 * Optional by config: with no SMTP host configured, sends are logged and
 * skipped. A failed send is logged too and never fails the caller — a mail
 * outage should not fail the request that triggered it.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger('Mail');
  private transporter: Transporter | null = null;

  get isEnabled(): boolean {
    return Boolean(getSmtpConfig().host);
  }

  async sendRestoreCode(
    email: string,
    username: string,
    code: string,
  ): Promise<void> {
    const link = publicUrl(`${getFrontendResetUrl()}${code}`);

    await this.send(
      email,
      RESTORE_SUBJECT,
      RESTORE_TEXT.replaceAll('{link}', link).replaceAll(
        '{username}',
        username,
      ),
      RESTORE_HTML.replaceAll('{link}', link).replaceAll(
        '{username}',
        escapeHtml(username),
      ),
    );
  }

  private async send(
    to: string,
    subject: string,
    text: string,
    html: string,
  ): Promise<void> {
    if (!to) {
      return;
    }

    const config = getSmtpConfig();

    if (!config.host) {
      this.logger.warn(`SMTP is not configured — skipped mail to ${to}`);
      return;
    }

    this.transporter ??= nodemailer.createTransport({
      host: config.host,
      port: config.port,
      // Port 25 is plain SMTP; only 465 is implicit TLS.
      secure: config.port === 465,
      ...(config.user
        ? { auth: { user: config.user, pass: config.password } }
        : {}),
    });

    try {
      await this.transporter.sendMail({
        from: config.from,
        to,
        subject,
        text,
        html,
      });
    } catch (error) {
      this.logger.warn(
        `could not send mail to ${to}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
