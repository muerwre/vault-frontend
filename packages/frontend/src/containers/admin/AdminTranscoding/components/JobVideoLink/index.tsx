import { FC } from 'react';

import { YOUTUBE_PROVIDER } from '@vault/common/media';
import { observer } from 'mobx-react-lite';

import { ApiMediaJob } from '~/api/admin/types';
import { useYoutubeMetadata } from '~/hooks/metadata/useYoutubeMetadata';

interface Props {
  job: ApiMediaJob;
  className?: string;
}

/** A job's video, named by its title once the metadata knows it. */
export const JobVideoLink: FC<Props> = observer(({ job, className }) => {
  const youtubeId =
    job.media?.provider === 'youtube' ? job.media.external_id : '';
  const title = useYoutubeMetadata(youtubeId)?.metadata?.title;

  const fallback = job.media
    ? `${job.media.provider}:${job.media.external_id}`
    : `#${job.id}`;

  return (
    <a
      href={youtubeId ? YOUTUBE_PROVIDER.canonicalUrl(youtubeId) : undefined}
      target="_blank"
      rel="noreferrer"
      className={className}
      title={title ? fallback : undefined}
    >
      {title || fallback}
    </a>
  );
});
