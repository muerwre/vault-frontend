import { FC, useCallback } from 'react';

import { YoutubeEmbed } from '~/components/media/YoutubeEmbed';
import { IBlock, IBlockEmbed } from '~/types';
import { getYoutubeId } from '~/utils/dom';

import { SubmitVideoAddCard } from '../../../SubmitVideoAddCard';
import { BlockEditorProps } from '../../types';

/**
 * One YouTube video: a link field until a link is given, then the video as
 * the post shows it, opening its page on click. Removing the video brings the
 * field back.
 */
const SubmitVideoBlock: FC<BlockEditorProps<IBlockEmbed>> = ({
  block,
  onChange,
}) => {
  // several links may be pasted at once; the block takes the first
  const onAdd = useCallback(
    ([first]: IBlock[]) =>
      first?.type === 'video' && onChange((it) => ({ ...it, url: first.url })),
    [onChange],
  );

  const onRemove = useCallback(
    () => onChange((it) => ({ ...it, url: '' })),
    [onChange],
  );

  if (!getYoutubeId(block.url)) {
    return <SubmitVideoAddCard existing={[]} onAdd={onAdd} variant="row" />;
  }

  return <YoutubeEmbed url={block.url} onDelete={onRemove} big asLink />;
};

export { SubmitVideoBlock };
