import React, { FC, memo, useMemo } from 'react';
import { ICommentBlock } from '~/constants/comment';
import styles from './styles.scss';
import { getYoutubeThumb } from '~/utils/dom';
import { selectPlayer } from '~/redux/player/selectors';
import { connect } from 'react-redux';
import * as PLAYER_ACTIONS from '~/redux/player/actions';

const mapStateToProps = state => ({
  youtubes: selectPlayer(state).youtubes,
});

const mapDispatchToProps = {
  playerGetYoutubeInfo: PLAYER_ACTIONS.playerGetYoutubeInfo,
};

type Props = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps & {
    block: ICommentBlock;
  };

const CommentEmbedBlockUnconnected: FC<Props> = memo(
  ({ block, youtubes, playerGetYoutubeInfo }) => {
    const link = useMemo(
      () =>
        block.content.match(
          /https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/(watch)?(\?v=)?([\w\-\=]+)/
        ),
      [block.content]
    );

    const preview = useMemo(() => getYoutubeThumb(block.content), [block.content]);

    useMemo(() => {
      if (!link[5] || youtubes[link[5]]) return;

      playerGetYoutubeInfo(link[5]);
    }, [playerGetYoutubeInfo]);

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
  }
);

const CommentEmbedBlock = connect(
  mapStateToProps,
  mapDispatchToProps
)(CommentEmbedBlockUnconnected);

export { CommentEmbedBlock };
