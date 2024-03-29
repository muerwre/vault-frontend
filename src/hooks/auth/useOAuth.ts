import { useCallback, useMemo } from 'react';

import useSWR from 'swr';

import {
  apiAttachSocial,
  apiDropSocial,
  apiGetSocials,
  apiLoginWithSocial,
} from '~/api/auth';
import { API } from '~/constants/api';
import { Dialog } from '~/constants/modal';
import { useAuth } from '~/hooks/auth/useAuth';
import { useModal } from '~/hooks/modal/useModal';
import { OAuthProvider } from '~/types/auth';
import { showErrorToast } from '~/utils/errors/showToast';
import { path } from '~/utils/ramda';

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
