import * as nodemailer from 'nodemailer';

import { MailService } from './mail.service';

jest.mock('nodemailer', () => ({ createTransport: jest.fn() }));

const createTransport = nodemailer.createTransport as jest.Mock;

describe('MailService', () => {
  const keys = ['SMTP_HOST', 'SMTP_FROM', 'PUBLIC_URL', 'FRONTEND_RESET_URL'];
  const saved = Object.fromEntries(keys.map((key) => [key, process.env[key]]));

  let sendMail: jest.Mock;
  let verify: jest.Mock;

  beforeEach(() => {
    process.env.SMTP_HOST = 'smtp.example';
    process.env.SMTP_FROM = 'vault@example.org';
    process.env.PUBLIC_URL = 'https://vault48.example';
    delete process.env.FRONTEND_RESET_URL;

    sendMail = jest.fn().mockResolvedValue({});
    verify = jest.fn().mockResolvedValue(true);
    createTransport.mockReturnValue({ sendMail, verify });
  });

  afterEach(() => {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
    jest.clearAllMocks();
  });

  it('sends the restore mail with its usual subject, text and html', async () => {
    await new MailService().sendRestoreCode(
      'user@example.org',
      'someone',
      'abc123',
    );

    const [mail] = sendMail.mock.calls[0];
    const link = 'https://vault48.example/restore/abc123';

    expect(mail).toMatchObject({
      from: 'vault@example.org',
      to: 'user@example.org',
      subject: 'Кто-то пытается сбросить пароль!',
    });
    expect(mail.text).toBe(
      'Привет, someone!\n\n' +
        'Кто-то (или что-то) попросило нас сбросить ваш пароль. \n\n' +
        'Если это что-то вы, то просто перейдите по ссылке и выберите новый пароль. \n\n' +
        'Или не делайте ничего. Зачем? Почему?\n\n' +
        `А! Ссылка: ${link}`,
    );
    expect(mail.html).toContain(`<a href="${link}">сбросить пароль</a>`);
    expect(mail.html).toMatch(/^<p>Привет, <b>someone<\/b>!<\/p><h4>Кто-то/);
  });

  it('escapes the username in the html body', async () => {
    await new MailService().sendRestoreCode(
      'user@example.org',
      '<b>x</b>',
      'abc123',
    );

    const [mail] = sendMail.mock.calls[0];

    expect(mail.html).toContain('&lt;b&gt;x&lt;/b&gt;');
    expect(mail.text).toContain('Привет, <b>x</b>!');
  });

  it('logs a failed send instead of failing the caller', async () => {
    sendMail.mockRejectedValue(new Error('connection refused'));

    await expect(
      new MailService().sendRestoreCode(
        'user@example.org',
        'someone',
        'abc123',
      ),
    ).resolves.toBeUndefined();
  });

  it('skips sending when SMTP is not configured', async () => {
    process.env.SMTP_HOST = '';

    await new MailService().sendRestoreCode(
      'user@example.org',
      'someone',
      'abc123',
    );

    expect(sendMail).not.toHaveBeenCalled();
  });

  describe('registration mails', () => {
    it('mails the registration link without a username', async () => {
      const result = await new MailService().sendRegistrationLink(
        'guest@example.org',
        'code-1',
      );

      const [mail] = sendMail.mock.calls[0];
      const link = 'https://vault48.example/register/code-1';

      expect(result).toEqual({ sent: true });
      expect(mail.to).toBe('guest@example.org');
      expect(mail.text).toContain(link);
      expect(mail.html).toContain(`<a href="${link}">`);
      expect(mail.text).not.toContain('{');
    });

    it('reports why a send failed', async () => {
      sendMail.mockRejectedValue(new Error('mailbox is full'));

      await expect(
        new MailService().sendRegistrationLink('guest@example.org', 'code-1'),
      ).resolves.toEqual({ sent: false, error: 'mailbox is full' });
    });

    it('points an existing account at a password reset', async () => {
      await new MailService().sendAlreadyRegistered(
        'user@example.org',
        'restore-1',
      );

      const [mail] = sendMail.mock.calls[0];

      expect(mail.text).toContain('https://vault48.example/restore/restore-1');
    });

    it('mails every admin, escaping the guest-written reason', async () => {
      await new MailService().sendApprovalRequest(
        ['a@example.org', 'b@example.org'],
        'guest@example.org',
        '<script>hi</script>',
      );

      expect(sendMail.mock.calls.map(([mail]) => mail.to)).toEqual([
        'a@example.org',
        'b@example.org',
      ]);

      const [mail] = sendMail.mock.calls[0];
      expect(mail.html).toContain('&lt;script&gt;hi&lt;/script&gt;');
      expect(mail.text).toContain('<script>hi</script>');
    });
  });

  describe('health', () => {
    it('is unavailable until the first check passes', async () => {
      const service = new MailService();

      expect(service.isAvailable).toBe(false);
      await expect(service.checkHealth()).resolves.toBe(true);
      expect(service.isAvailable).toBe(true);
    });

    it('is unavailable after a failed check', async () => {
      const service = new MailService();
      await service.checkHealth();

      verify.mockRejectedValue(new Error('connection refused'));

      await expect(service.checkHealth()).resolves.toBe(false);
      expect(service.isAvailable).toBe(false);
    });

    it('is unavailable without SMTP configured', async () => {
      process.env.SMTP_HOST = '';
      const service = new MailService();

      await expect(service.checkHealth()).resolves.toBe(false);
      expect(service.isAvailable).toBe(false);
      expect(verify).not.toHaveBeenCalled();
    });
  });
});
