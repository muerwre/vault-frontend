import { useCallback, useState } from 'react';

import { ApiUpdateUserRequest } from '~/api/auth/types';
import { usePatchUser } from '~/hooks/auth/usePatchUser';
import { IUser } from '~/types/auth';
import { getValidationErrors } from '~/utils/errors/getValidationErrors';
import { showErrorToast } from '~/utils/errors/showToast';

type Fields = Partial<ApiUpdateUserRequest['user']>;

/**
 * Saves the viewer's own profile fields and mirrors the result into the open
 * profile page. Resolves with the field errors on a validation failure, or
 * `undefined` once saved.
 */
export const useSaveProfile = (
  onSaved: (user: Partial<IUser>) => Promise<void> | void,
) => {
  const { save } = usePatchUser();
  const [isSaving, setIsSaving] = useState(false);

  const submit = useCallback(
    async (fields: Fields): Promise<Record<string, string> | undefined> => {
      setIsSaving(true);

      try {
        const user = await save(fields);
        await onSaved(user);
        return undefined;
      } catch (error) {
        const errors = getValidationErrors(error);

        if (!errors) {
          showErrorToast(error);
        }

        return errors ?? {};
      } finally {
        setIsSaving(false);
      }
    },
    [save, onSaved],
  );

  return { submit, isSaving };
};
