import { FC, useCallback, useMemo, useState } from 'react';

import { useFormik } from 'formik';

import { apiRequestRegistration } from '~/api/registration';
import { ApiRegistrationOutcome } from '~/api/registration/types';
import { BetterScrollDialog } from '~/components/common/BetterScrollDialog';
import { DialogTitle } from '~/components/common/DialogTitle';
import { Group } from '~/components/common/Group';
import { Icon } from '~/components/common/Icon';
import { Button } from '~/components/input/Button';
import { InputText } from '~/components/input/InputText';
import { Textarea } from '~/components/input/Textarea';
import { useCloseOnEscape } from '~/hooks';
import { useFeatures } from '~/hooks/auth/useFeatures';
import { DialogComponentProps } from '~/types/modal';
import { getValidationErrors } from '~/utils/errors/getValidationErrors';
import { showErrorToast } from '~/utils/errors/showToast';

import styles from './styles.module.scss';

const SENT_TEXT: Record<ApiRegistrationOutcome, string> = {
  mailed: 'Проверьте почту — мы отправили на неё ссылку для регистрации',
  awaiting_approval:
    'Заявка отправлена. Когда её одобрят, мы пришлём ссылку на почту',
};

/** Asks for an account by email; with approval on, also for a short resume. */
const RegisterRequestDialog: FC<DialogComponentProps> = ({
  onRequestClose,
}) => {
  useCloseOnEscape(onRequestClose);

  const { features, isLoading } = useFeatures();
  const isOpen = features.registration;
  const needsReason = features.registration_approval;

  const [outcome, setOutcome] = useState<ApiRegistrationOutcome>();

  const onSubmit = useCallback(
    async (
      values: { email: string; reason: string },
      { setErrors }: { setErrors: (errors: Record<string, string>) => void },
    ) => {
      try {
        const result = await apiRequestRegistration({
          email: values.email.trim(),
          reason: needsReason ? values.reason.trim() : undefined,
        });

        setOutcome(result.status);
      } catch (error) {
        showErrorToast(error);

        const validationErrors = getValidationErrors(error);
        if (validationErrors) {
          setErrors(validationErrors);
        }
      }
    },
    [needsReason],
  );

  const { values, errors, handleSubmit, setFieldValue, isSubmitting } =
    useFormik({
      initialValues: { email: '', reason: '' },
      onSubmit,
    });

  const footer = useMemo(
    () => (
      <Group className={styles.buttons}>
        <Button disabled={!isOpen || isSubmitting}>
          {needsReason ? 'Отправить заявку' : 'Зарегистрироваться'}
        </Button>
      </Group>
    ),
    [isOpen, isSubmitting, needsReason],
  );

  const overlay = outcome ? (
    <Group className={styles.shade}>
      <Icon icon="check" size={64} />
      <div>{SENT_TEXT[outcome]}</div>
      <div />
      <Button type="button" onClick={onRequestClose}>
        Отлично!
      </Button>
    </Group>
  ) : undefined;

  return (
    <form onSubmit={handleSubmit}>
      <BetterScrollDialog
        width={300}
        footer={footer}
        overlay={overlay}
        onClose={onRequestClose}
        is_loading={isLoading || isSubmitting}
      >
        <div className={styles.wrap}>
          <Group>
            <DialogTitle>Регистрация</DialogTitle>

            {!isLoading && !isOpen ? (
              <div className={styles.text}>
                Регистрация временно недоступна. Попробуйте позже.
              </div>
            ) : (
              <>
                <InputText
                  title="Email"
                  type="email"
                  value={values.email}
                  handler={(value) => setFieldValue('email', value)}
                  error={errors.email}
                  autoFocus
                />

                {needsReason && (
                  <Textarea
                    title="Резюме"
                    placeholder="Расскажите немного о себе и почему вы хотите к нам присоединиться"
                    value={values.reason}
                    handler={(value) => setFieldValue('reason', value)}
                    error={errors.reason}
                    minRows={4}
                    maxRows={12}
                  />
                )}

                <div className={styles.text}>
                  {needsReason
                    ? 'Заявку рассмотрят администраторы. Если её одобрят, мы пришлём ссылку для регистрации на почту.'
                    : 'Мы пришлём на почту ссылку, по которой можно выбрать имя и пароль.'}
                </div>
              </>
            )}
          </Group>
        </div>
      </BetterScrollDialog>
    </form>
  );
};

export { RegisterRequestDialog };
