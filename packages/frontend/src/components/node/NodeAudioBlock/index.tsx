import { FC } from 'react';

import { AudioList } from '~/components/common/AudioList';
import { NodeComponentProps } from '~/constants/node';
import { useAskToLogIn } from '~/hooks/auth/useAskToLogIn';
import { useWindowSize } from '~/hooks/dom/useWindowSize';
import { useNodeAudios } from '~/hooks/node/useNodeAudios';

interface Props extends NodeComponentProps {
  className?: string;
  /** Shows only this many songs from the top. */
  limit?: number;
  /** Renders the songs as compact player rows. Defaults to on tablets. */
  compact?: boolean;
}

const NodeAudioBlock: FC<Props> = ({ node, className, limit, compact }) => {
  const audios = useNodeAudios(node);
  const { isTablet } = useWindowSize();
  const askToLogIn = useAskToLogIn('song');

  return (
    <AudioList
      files={audios.slice(0, limit)}
      compact={compact ?? isTablet}
      className={className}
      onDisabledPlayPress={askToLogIn}
    />
  );
};

export { NodeAudioBlock };
