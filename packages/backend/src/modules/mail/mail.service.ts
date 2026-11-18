import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnModuleDestroy,
} from '@nestjs/common';
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

/** `{link}` is the registration link. No username: the account does not exist yet. */
const REGISTER_SUBJECT = 'Добро пожаловать в Убежище!';
const REGISTER_TEXT =
  'Привет!\n\n' +
  'Осталось выбрать имя пользователя и пароль — перейдите по ссылке: {link}\n\n' +
  'Ссылка действует 72 часа.\n\n' +
  'Если вы ничего не просили, просто проигнорируйте это письмо.';
const REGISTER_HTML =
  '<p>Привет!</p>' +
  '<p>Осталось выбрать имя пользователя и пароль — <a href="{link}">перейдите по ссылке</a>.</p>' +
  '<p>Ссылка действует 72 часа.</p>' +
  '<p>Если вы ничего не просили, просто проигнорируйте это письмо.</p>';

/** `{link}` is the password reset link for the existing account. */
const ALREADY_REGISTERED_SUBJECT = 'У вас уже есть аккаунт';
const ALREADY_REGISTERED_TEXT =
  'Привет!\n\n' +
  'Кто-то попросил зарегистрироваться с этим адресом, но аккаунт с ним уже есть.\n\n' +
  'Если забыли пароль, его можно сбросить по ссылке: {link}\n\n' +
  'Если это были не вы, просто проигнорируйте это письмо.';
const ALREADY_REGISTERED_HTML =
  '<p>Привет!</p>' +
  '<p>Кто-то попросил зарегистрироваться с этим адресом, но аккаунт с ним уже есть.</p>' +
  '<p>Если забыли пароль, <a href="{link}">его можно сбросить</a>.</p>' +
  '<p>Если это были не вы, просто проигнорируйте это письмо.</p>';

/** `{email}`, `{reason}` describe the request, `{link}` is the admin page. */
const APPROVAL_SUBJECT = 'Новая заявка на регистрацию';
const APPROVAL_TEXT =
  'Новая заявка на регистрацию от {email}.\n\n' +
  'Резюме:\n{reason}\n\n' +
  'Одобрить или отклонить: {link}';
const APPROVAL_HTML =
  '<p>Новая заявка на регистрацию от <b>{email}</b>.</p>' +
  '<h4>Резюме</h4>' +
  '<p style="white-space: pre-wrap">{reason}</p>' +
  '<p><a href="{link}">Одобрить или отклонить</a></p>';

/** Frontend pages the mails link to; the registration code is appended. */
const REGISTER_PATH = '/register/';
const ADMIN_USERS_PATH = '/admin/users';

const HEALTH_CHECK_MS = 60 * 60 * 1000;

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const fill = (
  template: string,
  values: Record<string, string>,
  escape: (value: string) => string = (value) => value,
): string =>
  Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, escape(value)),
    template,
  );

const describeError = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

/** Whether a mail went out, and why not. */
export type MailResult = { sent: true } | { sent: false; error: string };

/**
 * Optional by config: with no SMTP host configured, sends are logged and
 * skipped. The connection is verified at startup and then hourly; features
 * that cannot work without mail read {@link isAvailable}.
 */
@Injectable()
export class MailService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger('Mail');
  private transporter: Transporter | null = null;
  private healthy = false;
  private checked = false;
  private timer?: NodeJS.Timeout;

  get isEnabled(): boolean {
    return Boolean(getSmtpConfig().host);
  }

  /** Configured, and the last connection check passed. */
  get isAvailable(): boolean {
    return this.isEnabled && this.healthy;
  }

  onApplicationBootstrap(): void {
    if (!this.isEnabled) {
      return;
    }

    // Not awaited: an unreachable server must not hold up startup. Until the
    // first check finishes, mail counts as unavailable.
    void this.checkHealth();

    this.timer = setInterval(() => void this.checkHealth(), HEALTH_CHECK_MS);
    this.timer.unref();
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  /** Verifies the SMTP connection and records the result. */
  async checkHealth(): Promise<boolean> {
    const transporter = this.getTransporter();

    if (!transporter) {
      this.healthy = false;
      return false;
    }

    // Logged on changes only, so a lasting outage does not repeat every hour.
    const first = !this.checked;
    const was = this.healthy;
    this.checked = true;

    try {
      await transporter.verify();
      this.healthy = true;

      if (first || !was) {
        this.logger.log('SMTP is reachable');
      }
    } catch (error) {
      this.healthy = false;

      if (first || was) {
        this.logger.warn(`SMTP is unreachable: ${describeError(error)}`);
      }
    }

    return this.healthy;
  }

  /** Best-effort: a failure is logged and never reaches the caller. */
  async sendRestoreCode(
    email: string,
    username: string,
    code: string,
  ): Promise<void> {
    const values = {
      link: publicUrl(`${getFrontendResetUrl()}${code}`),
      username,
    };

    await this.send(
      email,
      RESTORE_SUBJECT,
      fill(RESTORE_TEXT, values),
      fill(RESTORE_HTML, values, escapeHtml),
    );
  }

  sendRegistrationLink(email: string, code: string): Promise<MailResult> {
    const values = { link: publicUrl(`${REGISTER_PATH}${code}`) };

    return this.send(
      email,
      REGISTER_SUBJECT,
      fill(REGISTER_TEXT, values),
      fill(REGISTER_HTML, values, escapeHtml),
    );
  }

  sendAlreadyRegistered(
    email: string,
    restoreCode: string,
  ): Promise<MailResult> {
    const values = {
      link: publicUrl(`${getFrontendResetUrl()}${restoreCode}`),
    };

    return this.send(
      email,
      ALREADY_REGISTERED_SUBJECT,
      fill(ALREADY_REGISTERED_TEXT, values),
      fill(ALREADY_REGISTERED_HTML, values, escapeHtml),
    );
  }

  /** Best-effort, one mail per admin. */
  async sendApprovalRequest(
    admins: string[],
    email: string,
    reason: string,
  ): Promise<void> {
    const values = { email, reason, link: publicUrl(ADMIN_USERS_PATH) };

    for (const admin of admins) {
      await this.send(
        admin,
        APPROVAL_SUBJECT,
        fill(APPROVAL_TEXT, values),
        fill(APPROVAL_HTML, values, escapeHtml),
      );
    }
  }

  private getTransporter(): Transporter | null {
    const config = getSmtpConfig();

    if (!config.host) {
      return null;
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

    return this.transporter;
  }

  /** Never throws; resolves whether the mail went out. */
  private async send(
    to: string,
    subject: string,
    text: string,
    html: string,
  ): Promise<MailResult> {
    if (!to) {
      return { sent: false, error: 'no recipient' };
    }

    const transporter = this.getTransporter();

    if (!transporter) {
      this.logger.warn(`SMTP is not configured — skipped mail to ${to}`);
      return { sent: false, error: 'SMTP is not configured' };
    }

    try {
      await transporter.sendMail({
        from: getSmtpConfig().from,
        to,
        subject,
        text,
        html,
      });

      return { sent: true };
    } catch (error) {
      const message = describeError(error);
      this.logger.warn(`could not send mail to ${to}: ${message}`);

      return { sent: false, error: message };
    }
  }
}
