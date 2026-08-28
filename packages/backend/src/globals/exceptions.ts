import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ERROR_CODES, type ErrorCode } from '@vault/common/constants';
import type { IErrorResponse, IValidationErrorResponse } from '@vault/common/types';
import type { Response } from 'express';

/**
 * A domain error carrying one of the frozen wire codes.
 *
 * Prefer this over Nest's built-in exceptions: the frontend's axios interceptor
 * branches on `data.error`, and Nest's defaults would emit
 * `{ statusCode, message }` instead.
 */
export class VaultException extends HttpException {
  constructor(
    public readonly code: ErrorCode,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    public readonly text?: string,
  ) {
    super(code, status);
  }
}

/** Validation failure carrying per-field messages. */
export class VaultValidationException extends VaultException {
  constructor(
    public readonly fields: Record<string, string>,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    text?: string,
  ) {
    super(ERROR_CODES.IncorrectData, status, text);
  }
}

/**
 * Human-readable text per code. Kept deliberately terse — the frontend renders
 * its own copy from the code and only falls back to `message` for unknown ones.
 */
const ERROR_TEXT: Partial<Record<string, string>> = {
  [ERROR_CODES.NotAuthorized]: 'Не авторизован',
  [ERROR_CODES.NotEnoughRights]: 'Недостаточно прав',
  [ERROR_CODES.IncorrectData]: 'Неверные данные',
  [ERROR_CODES.IncorrectPassword]: 'Неверный пароль',
  [ERROR_CODES.UserNotFound]: 'Пользователь не найден',
  [ERROR_CODES.NodeNotFound]: 'Пост не найден',
  [ERROR_CODES.CommentNotFound]: 'Комментарий не найден',
  [ERROR_CODES.MessageNotFound]: 'Сообщение не найдено',
  [ERROR_CODES.NoteNotFound]: 'Заметка не найдена',
  [ERROR_CODES.TagNotFound]: 'Тег не найден',
  [ERROR_CODES.CodeIsInvalid]: 'Неверный код',
  [ERROR_CODES.FilesIsTooBig]: 'Файл слишком большой',
  [ERROR_CODES.UnknownFileType]: 'Неизвестный тип файла',
  [ERROR_CODES.UserExist]: 'Пользователь уже существует',
  [ERROR_CODES.UnexpectedBehavior]: 'Что-то пошло не так',
};

/**
 * Renders **every** failure as the frozen error envelope
 * `{ error, message }` (plus `errors` for validation failures).
 *
 * Registered globally, so it also catches Nest's own exceptions (404 from an
 * unmatched route, 413 from the body parser, …) and unexpected throws — none of
 * which would otherwise use the shape the frontend parses.
 */
@Catch()
export class VaultExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof VaultValidationException) {
      const body: IValidationErrorResponse = {
        error: exception.code,
        message: exception.text ?? ERROR_TEXT[exception.code] ?? exception.code,
        errors: exception.fields,
      };

      response.status(exception.getStatus()).json(body);
      return;
    }

    if (exception instanceof VaultException) {
      response.status(exception.getStatus()).json(this.envelope(exception.code, exception.text));
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();

      /**
       * Only reached for exceptions Nest raised itself — an unmatched route, a
       * body-parser rejection, and so on. Handlers throw `VaultException` with a
       * precise code and are handled above.
       *
       * A 401 makes the frontend log the user out, so it must only ever mean
       * "not authenticated".
       */
      const code =
        status === HttpStatus.UNAUTHORIZED
          ? ERROR_CODES.NotAuthorized
          : status === HttpStatus.FORBIDDEN
            ? ERROR_CODES.NotEnoughRights
            : status === HttpStatus.NOT_FOUND
              ? ERROR_CODES.EmptyRequest
              : status === HttpStatus.PAYLOAD_TOO_LARGE
                ? ERROR_CODES.FilesIsTooBig
                : ERROR_CODES.IncorrectData;

      response.status(status).json(this.envelope(code, exception.message));
      return;
    }

    // Genuinely unexpected: log with the stack, but never leak internals on the wire.
    this.logger.error(
      exception instanceof Error ? exception.message : String(exception),
      exception instanceof Error ? exception.stack : undefined,
    );

    response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json(this.envelope(ERROR_CODES.UnexpectedBehavior));
  }

  private envelope(code: ErrorCode | string, text?: string): IErrorResponse {
    return {
      error: code,
      message: text ?? ERROR_TEXT[code] ?? code,
    };
  }
}
