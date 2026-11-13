import { MIN_PASSWORD_LENGTH, USERNAME_REGEX } from '@vault/common/constants';

export interface RegisterFields {
  username?: string;
  password?: string;
}

/**
 * Per-field errors for social registration, or null when the input is usable.
 *
 * Both fields are reported together; the frontend renders a message per input,
 * so masking one behind the other would hide a problem the user must fix anyway.
 */
export const validateSocialRegister = (
  fields: RegisterFields,
): Record<string, string> | null => {
  const errors: Record<string, string> = {};
  const username = fields.username ?? '';
  const password = fields.password ?? '';

  if (!USERNAME_REGEX.test(username)) {
    errors.username =
      'Имя пользователя: 3-64 символа, только латиница, цифры, дефис и подчёркивание';
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Пароль должен быть не короче ${MIN_PASSWORD_LENGTH} символов`;
  }

  return Object.keys(errors).length > 0 ? errors : null;
};
