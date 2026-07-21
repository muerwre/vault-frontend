import useSWR from 'swr';

import { apiCheckRestoreCode } from '~/api/auth';
import { API } from '~/constants/api';
import { getErrorMessage } from '~/utils/errors/getErrorMessage';

export const useRestoreCode = (code: string) => {
  const { data, isValidating, error } = useSWR(
    API.USER.REQUEST_CODE(code),
    () => apiCheckRestoreCode({ code }),
  );

  const codeUser = data?.user;

  return { codeUser, isLoading: isValidating, error: getErrorMessage(error) };
};
