import { FC, useCallback, useState } from 'react';

import { Link2Icon } from 'lucide-react';
import useSWR, { useSWRConfig } from 'swr';

import {
  apiGetRegistrationRequests,
  apiRegistrationAction,
} from '~/api/registration';
import { ApiRegistrationRequest } from '~/api/registration/types';
import { Columns } from '~/components/common/Columns';
import { Button } from '~/components/input/Button';
import { API } from '~/constants/api';
import { getPrettyDate } from '~/utils/dom';
import { showErrorToast } from '~/utils/errors/showToast';
import { showToastInfo } from '~/utils/toast';

import styles from './styles.module.scss';

type Action = 'approve' | 'reject' | 'resend';

/** Attempts the backend makes before leaving an invite to an admin. */
const MAX_ATTEMPTS = 3;

/** One line on where the request or its link stands. */
const describe = (request: ApiRegistrationRequest): string => {
  if (request.status === 'pending_approval') {
    return 'Ждёт одобрения';
  }

  if (request.delivery === 'failed') {
    return `Не удалось отправить: ${request.last_error || 'неизвестная ошибка'}`;
  }

  if (request.delivery === 'queued') {
    const retry = request.next_attempt_at
      ? `, повтор ${getPrettyDate(request.next_attempt_at)}`
      : '';

    return request.send_attempts > 0
      ? `Не отправлено (${request.send_attempts}/${MAX_ATTEMPTS}): ${request.last_error}${retry}`
      : `В очереди на отправку${retry}`;
  }

  if (request.is_expired) {
    return 'Ссылка устарела';
  }

  return request.last_sent_at
    ? `Приглашение отправлено ${getPrettyDate(request.last_sent_at)}`
    : 'Приглашение отправлено';
};

const copyLink = async (link: string) => {
  try {
    await navigator.clipboard.writeText(link);
    showToastInfo('Ссылка скопирована');
  } catch (error) {
    showErrorToast(error);
  }
};

/** Failed or expired invites need a retry; working ones can be sent again. */
const needsRetry = (request: ApiRegistrationRequest) =>
  request.delivery === 'failed' || request.is_expired;

/**
 * Registration requests awaiting an admin, and invites not used yet. Hidden
 * entirely while there are none.
 */
const AdminRegistrations: FC = () => {
  const { mutate: mutateGlobal } = useSWRConfig();
  const { data, mutate } = useSWR(
    API.ADMIN.REGISTRATIONS,
    apiGetRegistrationRequests,
  );
  const [busy, setBusy] = useState<number>();

  const act = useCallback(
    async (id: number, action: Action) => {
      setBusy(id);

      try {
        await apiRegistrationAction(id, action);
        await mutate();
        // The header's red dot counts pending requests.
        await mutateGlobal(API.USER.GET_UPDATES);
      } catch (error) {
        showErrorToast(error);
      } finally {
        setBusy(undefined);
      }
    },
    [mutate, mutateGlobal],
  );

  if (!data?.requests.length) {
    return null;
  }

  const pending = data.requests.filter(
    (request) => request.status === 'pending_approval',
  );
  const invites = data.requests.filter(
    (request) => request.status === 'approved',
  );

  const renderCard = (request: ApiRegistrationRequest) => (
    <div key={request.id}>
      <div className={styles.card}>
        <div className={styles.head}>
          <span className={styles.email}>{request.email}</span>
          <span className={styles.muted}>
            {getPrettyDate(request.requested_at || request.created_at || '')}
          </span>
        </div>

        {request.reason && (
          <div className={styles.reason}>{request.reason}</div>
        )}

        <div
          className={
            request.delivery === 'failed' ? styles.error : styles.muted
          }
        >
          {describe(request)}
        </div>

        {request.link && (
          <div className={styles.link}>
            <a href={request.link} target="_blank" rel="noreferrer">
              {request.link}
            </a>
            <Button
              size="small"
              color="gray"
              iconLeft={<Link2Icon size={20} />}
              iconOnly
              label="Скопировать ссылку"
              onClick={() => copyLink(request.link ?? '')}
            />
          </div>
        )}

        {/* Destructive action first, the main one on the right. */}
        <div className={styles.actions}>
          {request.status === 'pending_approval' && (
            <>
              <Button
                size="small"
                color="gray"
                disabled={busy === request.id}
                onClick={() => act(request.id, 'reject')}
              >
                Отклонить
              </Button>
              <Button
                size="small"
                color="primary"
                disabled={busy === request.id}
                onClick={() => act(request.id, 'approve')}
              >
                Одобрить
              </Button>
            </>
          )}

          {request.status === 'approved' && (
            <>
              <Button
                size="small"
                color="gray"
                disabled={busy === request.id}
                onClick={() => act(request.id, 'reject')}
              >
                Отозвать
              </Button>
              <Button
                size="small"
                color={needsRetry(request) ? 'primary' : 'gray'}
                disabled={busy === request.id}
                onClick={() => act(request.id, 'resend')}
              >
                {needsRetry(request) ? 'Повторить' : 'Отправить ещё раз'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.wrap}>
      {pending.length > 0 && (
        <section className={styles.section}>
          <header className={styles.header}>
            <h2 className={styles.title}>Заявки</h2>
            <span className={styles.count}>{pending.length}</span>
          </header>
          <Columns>{pending.map(renderCard)}</Columns>
        </section>
      )}

      {invites.length > 0 && (
        <section className={styles.section}>
          <header className={styles.header}>
            <h2 className={styles.title}>Приглашения</h2>
            <span className={styles.count}>{invites.length}</span>
          </header>
          <Columns>{invites.map(renderCard)}</Columns>
        </section>
      )}
    </div>
  );
};

export { AdminRegistrations };
