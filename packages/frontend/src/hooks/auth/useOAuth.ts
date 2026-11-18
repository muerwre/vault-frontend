import { useCallback, useMemo } from 'react';

import useSWR from 'swr';

import {
  apiAttachSocial,
  apiDropSocial,
  apiGetSocials,
  apiLoginWithSocial,
} from '~/api/auth';
import { API } from '~/constants/api';
import { ERRORS } from '~/constants/errors';
import { Dialog } from '~/constants/modal';
import { useAuth } from '~/hooks/auth/useAuth';
import { useModal } from '~/hooks/modal/useModal';
import { OAuthProvider } from '~/types/auth';
import { CONFIG } from '~/utils/config';
import { showErrorToast } from '~/utils/errors/showToast';
import { path } from '~/utils/ramda';
import { showToastError } from '~/utils/toast';

export const useOAuth = () => {
  const { isUser, setToken } = useAuth();
  const { showModal, hideModal } = useModal();

  const {
    data,
    isValidating: isLoading,
    mutate,
  } = useSWR(isUser ? API.USER.GET_SOCIALS : null, async () => {
    const result = await apiGetSocials();
    return result.accounts;
  });

  const openOauthWindow = useCallback((provider: OAuthProvider) => {
    window.open(API.USER.OAUTH_WINDOW(provider), '', 'width=600,height=400');
  }, []);

  const createSocialAccount = useCallback(
    async (token?: string) => {
      try {
        if (!token) return;

        const result = await apiLoginWithSocial({ token });

        setToken(result.token);
        hideModal();
      } catch (error) {
        const needsRegister = path(['response', 'status'], error) === 428;

        if (needsRegister && token) {
          showModal(Dialog.LoginSocialRegister, { token });
          return;
        }

        // Unknown account: users register by email, not through a provider.
        if (
          path(['response', 'data', 'error'], error) ===
          ERRORS.OAUTH_ACCOUNT_NOT_FOUND
        ) {
          showToastError(
            CONFIG.registrationEnabled
              ? 'Аккаунт не найден, зарегистрируйтесь'
              : 'Аккаунт не найден',
          );
          return;
        }

        showErrorToast(error);
      }
    },
    [showModal, hideModal, setToken],
  );

  const loginWithSocial = useCallback(
    (token: string | undefined) => {
      if (!token) {
        return;
      }

      setToken(token);
      hideModal();
    },
    [setToken, hideModal],
  );

  const attachAccount = useCallback(
    async (token?: string) => {
      try {
        if (!token) return;

        await apiAttachSocial({ token });
        await mutate();
      } catch (error) {
        showErrorToast(error);
      }
    },
    [mutate],
  );

  const dropAccount = useCallback(
    async (provider: OAuthProvider, id: string) => {
      try {
        await apiDropSocial({ id, provider });
        await mutate();
      } catch (error) {
        showErrorToast(error);
      }
    },
    [mutate],
  );

  const accounts = useMemo(() => data || [], [data]);

  const hasTelegram = useMemo(
    () => accounts.some((acc) => acc.provider === 'telegram'),
    [accounts],
  );

  const showTelegramModal = useCallback(
    () => showModal(Dialog.TelegramAttach, {}),
    [showModal],
  );

  return {
    hasTelegram,
    showTelegramModal,
    openOauthWindow,
    loginWithSocial,
    createSocialAccount,
    attachAccount,
    dropAccount,
    accounts,
    isLoading: !data && isLoading,
    refresh: mutate,
  };
};
