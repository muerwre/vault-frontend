import { IResultWithStatus } from '~/redux/types';
import { HTTP_RESPONSES } from '~/utils/api';

export const userLoginTransform = ({ status, data, error }: IResultWithStatus<any>): IResultWithStatus<any> => {
  switch (true) {
    case (status === HTTP_RESPONSES.UNAUTHORIZED || !data.token) && status !== HTTP_RESPONSES.CONNECTION_REFUSED:
      return { status, data, error: 'Пользователь не найден' };

    case status === 200:
      return { status, data, error: null };

    default:
      return { status, data, error: error || 'Неизвестная ошибка' };
  }
};
