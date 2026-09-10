import {
  Catch,
  HttpStatus,
  Logger,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import type { Response } from 'express';

import { renderPopupError } from './oauth.popup';

/**
 * Renders any failure during the provider callback as the popup error page.
 *
 * Without it the user would be left staring at a JSON error body inside the
 * popup, with the opener never told the attempt failed.
 */
@Catch()
export class OAuthPopupErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger('OAuth/popup');

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const message =
      exception instanceof Error ? exception.message : String(exception);

    this.logger.warn(`callback failed: ${message}`);

    response
      .status(HttpStatus.OK)
      .type('html')
      .send(
        renderPopupError(
          'Не удалось войти через социальную сеть, попробуйте ещё раз',
        ),
      );
  }
}
