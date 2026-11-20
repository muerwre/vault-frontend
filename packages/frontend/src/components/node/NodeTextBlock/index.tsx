import { FC, ReactNode, useCallback, useMemo } from 'react';

import { IMAGE_BLOCK_MODES, ImageBlockMode } from '@vault/common/constants';
import classNames from 'classnames';

import { AudioList } from '~/components/common/AudioList';
import { ImageGrid } from '~/components/common/ImageGrid';
import { YoutubeEmbed } from '~/components/media/YoutubeEmbed';
import { NodeComponentProps } from '~/constants/node';
import { useColorGradientFromString } from '~/hooks/color/useColorGradientFromString';
import { useWindowSize } from '~/hooks/dom/useWindowSize';
import { useImageModal } from '~/hooks/navigation/useImageModal';
import markdown from '~/styles/common/markdown.module.scss';
import { IBlock, IFile } from '~/types';
import { formatTextParagraphs } from '~/utils/dom';
import { VideoPlayerProvider } from '~/utils/providers/VideoPlayerProvider';

import { ImageSlider } from './components/ImageSlider';
import styles from './styles.module.scss';

interface Props extends NodeComponentProps {}

const TextContent: FC<{ text: string }> = ({ text }) => {
  const html = useMemo(() => formatTextParagraphs(text), [text]);

  return (
    <div
      className={markdown.wrapper}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

const ImagesContent: FC<{ files: IFile[]; mode: ImageBlockMode }> = ({
  files,
  mode,
}) => {
  const showImageModal = useImageModal();

  const onClick = useCallback(
    (file: IFile) => showImageModal(files, files.indexOf(file)),
    [files, showImageModal],
  );

  return mode === IMAGE_BLOCK_MODES.SLIDER ? (
    <ImageSlider files={files} onClick={onClick} />
  ) : (
    <ImageGrid files={files} onClick={onClick} />
  );
};

const renderBlock = (block: IBlock, isTablet: boolean): ReactNode => {
  switch (block.type) {
    case 'text':
      return <TextContent text={block.text} />;

    case 'images':
      return block.files.length ? (
        <ImagesContent files={block.files} mode={block.mode} />
      ) : null;

    case 'video':
      return <YoutubeEmbed url={block.url} big />;

    case 'audio':
      return block.files.length ? (
        <AudioList files={block.files} compact={isTablet} />
      ) : null;

    default:
      return null;
  }
};

/** A text post's content: its blocks of text, photos, video and songs, in order. */
const NodeTextBlock: FC<Props> = ({ node }) => {
  const background = useColorGradientFromString(node.title, 3, 2);
  const { isTablet } = useWindowSize();

  // the comments have a player of their own; this one plays the post's video
  return (
    <VideoPlayerProvider>
      <div className={classNames(styles.text)} style={{ background }}>
        {(node.blocks || []).map((block, index) => (
          <div className={styles.block} key={index}>
            {renderBlock(block, isTablet)}
          </div>
        ))}
      </div>
    </VideoPlayerProvider>
  );
};

export { NodeTextBlock };
