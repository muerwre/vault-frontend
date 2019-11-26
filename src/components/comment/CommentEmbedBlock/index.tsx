import React, { FC, memo, useMemo } from 'react';
import { ICommentBlock } from '~/constants/comment';
import styles from './styles.scss';
import { getYoutubeTitle } from '~/utils/dom';
import { Icon } from '~/components/input/Icon';

interface IProps {
  block: ICommentBlock;
}

const CommentEmbedBlock: FC<IProps> = memo(({ block }) => {
  const link = block.content.match(
    /(https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/(watch)?(\?v=)?[\w\-\&\=]+)/gi
  );

  const preview = useMemo(() => {
    const match =
      block.content &&
      block.content.match(
        /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?[\w\?=]*)?/
      );

    return match && match[1] ? `http://img.youtube.com/vi/${match[1]}/maxresdefault.jpg` : null;
  }, [block.content]);

  return (
    <div className={styles.embed}>
      <a href={link[0]} target="_blank" />

      <div className={styles.preview}>
        <div style={{ backgroundImage: `url("${preview}")` }}>
          <div className={styles.backdrop}>{link[0]}</div>
        </div>
      </div>
    </div>
  );
});

export { CommentEmbedBlock };
