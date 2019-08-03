import {IResultWithStatus} from "~/redux/types";

export const userLoginTransform = ({ status, data,error }: IResultWithStatus<any>): IResultWithStatus<any> => {
  switch(true) {
    case status === 401 || !data.access || data.refresh:
      return { status, data, error: 'Пользователь не найден' };

    case status === 200:
      return { status, data, error: null };

    default:
      return { status, data, error: error || 'Неизвестная ошибка' };
  }
}
