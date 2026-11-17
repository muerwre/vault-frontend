import { FC, Fragment, ReactNode, useCallback, useState } from 'react';

import { YOUTUBE_PROVIDER } from '@vault/common/media';
import classNames from 'classnames';
import useSWR from 'swr';

import {
  apiGetMediaJobs,
  apiGetMediaSummary,
  apiRetryMediaJob,
} from '~/api/admin';
import {
  ApiMediaJob,
  ApiMediaSummary,
  MEDIA_JOB_FILTERS,
  MediaJobFilter,
} from '~/api/admin/types';
import { LoaderCircle } from '~/components/common/LoaderCircle';
import { Button } from '~/components/input/Button';
import { HorizontalMenu } from '~/components/menu/HorizontalMenu';
import { API } from '~/constants/api';
import { showErrorToast } from '~/utils/errors/showToast';

import {
  FETCHER_ONLINE_MS,
  formatBytes,
  formatDuration,
  formatRelative,
} from './format';
import {
  JOB_FILTER_LABELS,
  RETRYABLE_FILTERS,
  SKIP_REASON_LABELS,
  VIDEO_STATUS_LABELS,
} from './labels';
import styles from './styles.module.scss';

const REFRESH_MS = 30_000;

/** Statuses shown as tiles, in this order; the rest are folded away. */
const TILE_STATUSES = [
  'ready',
  'queued',
  'downloading',
  'failed',
  'unavailable',
  'skipped',
];

const videoUrl = (job: ApiMediaJob) =>
  job.media?.provider === 'youtube'
    ? YOUTUBE_PROVIDER.canonicalUrl(job.media.external_id)
    : undefined;

/** Why nothing is being downloaded, when that is the case. */
const disabledReason = (data: ApiMediaSummary): ReactNode => {
  if (!data.enabled) {
    return (
      <>
        Выключено: в окружении бэкенда не задано{' '}
        <code>CACHE_EXTERNAL_MEDIA=true</code>. Ссылки на видео не
        отслеживаются, загрузчики заданий не получают.
      </>
    );
  }

  if (data.settings.fetcher_keys === 0) {
    return (
      <>
        Включено, но не задан <code>MEDIA_FETCHER_KEYS</code>: бэкенд отказывает
        любому загрузчику, и видео не скачиваются.
      </>
    );
  }

  return null;
};

/** The settings in force, each with the variable that sets it. */
const settingRows = (
  data: ApiMediaSummary,
): Array<{ title: string; env: string; value: ReactNode }> => {
  const { settings } = data;

  return [
    {
      title: 'Кэширование',
      env: 'CACHE_EXTERNAL_MEDIA',
      value: data.enabled ? 'включено' : 'выключено',
    },
    {
      title: 'Ключи загрузчиков',
      env: 'MEDIA_FETCHER_KEYS',
      value: settings.fetcher_keys > 0 ? settings.fetcher_keys : 'не заданы',
    },
    {
      title: 'Качество по длине',
      env: 'MEDIA_QUALITY_TIERS',
      value: `${settings.quality_tiers}; длиннее — не сохраняются`,
    },
    {
      title: 'Размер файла',
      env: 'MEDIA_MAX_MB',
      value: `до ${settings.max_mb} МБ`,
    },
    {
      title: 'Старых видео за раз',
      env: 'MEDIA_BACKLOG_BATCH',
      value: settings.backlog_batch,
    },
    {
      title: 'Когда добавлять старые',
      env: 'MEDIA_BACKLOG_CRON',
      value: <code>{settings.backlog_cron}</code>,
    },
    {
      title: 'Пересканирование ссылок',
      env: 'MEDIA_RESCAN_CRON',
      value: <code>{settings.rescan_cron}</code>,
    },
    {
      title: 'Очистка',
      env: 'MEDIA_CLEANUP_CRON',
      value: <code>{settings.cleanup_cron}</code>,
    },
    {
      title: 'Хранить видео удалённого',
      env: 'MEDIA_GC_GRACE_DAYS',
      value: `${settings.grace_days} дн`,
    },
    {
      title: 'Часовой пояс расписаний',
      env: 'SCHEDULE_TIMEZONE',
      value: settings.time_zone,
    },
  ];
};

/**
 * The media cache at a glance: what is stored and queued, which fetchers are
 * connected, and the jobs of one status, with a way to retry them.
 */
const AdminTranscoding: FC = () => {
  const [filter, setFilter] = useState<MediaJobFilter>('failed');
  const [retrying, setRetrying] = useState<number | null>(null);

  const summary = useSWR(API.ADMIN.MEDIA_SUMMARY, apiGetMediaSummary, {
    refreshInterval: REFRESH_MS,
  });
  const jobs = useSWR(
    [API.ADMIN.MEDIA_JOBS, filter],
    () => apiGetMediaJobs(filter),
    {
      refreshInterval: REFRESH_MS,
    },
  );

  const retry = useCallback(
    async (id: number) => {
      setRetrying(id);

      try {
        await apiRetryMediaJob(id);
        await Promise.all([jobs.mutate(), summary.mutate()]);
      } catch (error) {
        showErrorToast(error);
      } finally {
        setRetrying(null);
      }
    },
    [jobs, summary],
  );

  const data = summary.data;

  if (!data) {
    return (
      <div className={styles.loading}>
        <LoaderCircle size={32} />
      </div>
    );
  }

  const failedJobs = data.jobs
    .filter((row) => row.status === 'failed')
    .reduce((sum, row) => sum + row.count, 0);

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <h2 className={styles.title}>Транскодирование</h2>
        <span
          className={classNames(styles.badge, {
            [styles.badge_on]: data.enabled,
          })}
        >
          {data.enabled ? 'Включено' : 'Выключено'}
        </span>
      </header>

      {disabledReason(data) && (
        <div className={styles.notice}>{disabledReason(data)}</div>
      )}

      <section className={styles.tiles}>
        <div className={styles.tile}>
          <div className={styles.value}>{formatBytes(data.storage.bytes)}</div>
          <div className={styles.label}>
            на диске, {data.storage.files} видео
          </div>
        </div>

        {TILE_STATUSES.map((status) => (
          <div key={status} className={styles.tile}>
            <div className={styles.value}>{data.items[status] ?? 0}</div>
            <div className={styles.label}>{VIDEO_STATUS_LABELS[status]}</div>
          </div>
        ))}

        <div className={styles.tile}>
          <div className={styles.value}>{data.backlog_waiting}</div>
          <div className={styles.label}>старых ждут очереди</div>
        </div>

        <div className={styles.tile}>
          <div className={styles.value}>{failedJobs}</div>
          <div className={styles.label}>заданий с ошибкой</div>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.subtitle}>Загрузчики</h3>

        {data.fetchers.length === 0 ? (
          <div className={styles.empty}>
            С момента запуска сервера ни один загрузчик не выходил на связь
          </div>
        ) : (
          <ul className={styles.list}>
            {data.fetchers.map((fetcher) => {
              const online =
                Date.now() - new Date(fetcher.last_seen_at).getTime() <
                FETCHER_ONLINE_MS;

              return (
                <li key={fetcher.name} className={styles.fetcher}>
                  <span
                    className={classNames(styles.dot, {
                      [styles.dot_on]: online,
                    })}
                  />
                  <b>{fetcher.name}</b>
                  <span className={styles.muted}>
                    yt-dlp {fetcher.yt_dlp_version || '?'}
                  </span>
                  <span className={styles.muted}>
                    {formatRelative(fetcher.last_seen_at)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className={styles.section}>
        <h3 className={styles.subtitle}>Задания</h3>

        <HorizontalMenu className={styles.filters}>
          {MEDIA_JOB_FILTERS.map((key) => (
            <HorizontalMenu.Item
              key={key}
              active={filter === key}
              onClick={() => setFilter(key)}
            >
              {JOB_FILTER_LABELS[key]}
            </HorizontalMenu.Item>
          ))}
        </HorizontalMenu>

        {!jobs.data ? (
          <div className={styles.loading}>
            <LoaderCircle size={24} />
          </div>
        ) : jobs.data.jobs.length === 0 ? (
          <div className={styles.empty}>Пусто</div>
        ) : (
          <ul className={styles.list}>
            {jobs.data.jobs.map((job) => (
              <li key={job.id} className={styles.job}>
                <div className={styles.job_head}>
                  <a
                    href={videoUrl(job)}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.video}
                  >
                    {job.media
                      ? `${job.media.provider}:${job.media.external_id}`
                      : `#${job.id}`}
                  </a>

                  {job.media?.duration ? (
                    <span className={styles.muted}>
                      {formatDuration(job.media.duration)}
                    </span>
                  ) : null}

                  {job.media?.skip_reason && (
                    <span className={styles.muted}>
                      {SKIP_REASON_LABELS[job.media.skip_reason] ??
                        job.media.skip_reason}
                    </span>
                  )}

                  <span className={styles.muted}>
                    попыток: {job.attempts}
                    {job.status === 'running' && `, ${job.progress}%`}
                  </span>

                  {RETRYABLE_FILTERS.includes(filter) && (
                    <Button
                      size="mini"
                      color="outline"
                      className={styles.retry}
                      disabled={retrying === job.id}
                      onClick={() => retry(job.id)}
                    >
                      Повторить
                    </Button>
                  )}
                </div>

                {job.last_error && (
                  <div className={styles.error}>{job.last_error}</div>
                )}

                <div className={styles.muted}>
                  {job.next_attempt_at
                    ? `следующая попытка ${formatRelative(job.next_attempt_at)}`
                    : `обновлено ${formatRelative(job.updated_at)}`}
                  {job.lease_owner && ` · у загрузчика ${job.lease_owner}`}
                </div>
              </li>
            ))}
          </ul>
        )}

        {jobs.data && jobs.data.total > jobs.data.jobs.length && (
          <div className={styles.muted}>
            показаны {jobs.data.jobs.length} из {jobs.data.total}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h3 className={styles.subtitle}>Настройки</h3>

        <dl className={styles.settings}>
          {settingRows(data).map((row) => (
            <Fragment key={row.env}>
              <dt>
                {row.title}
                <code className={styles.env}>{row.env}</code>
              </dt>
              <dd>{row.value}</dd>
            </Fragment>
          ))}
        </dl>
      </section>
    </div>
  );
};

export { AdminTranscoding };
