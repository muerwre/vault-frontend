import React, { FC, memo, useMemo, useEffect } from 'react';
import { ICommentBlockProps } from '~/constants/comment';
import styles from './styles.module.scss';
import { getYoutubeThumb } from '~/utils/dom';
import { selectPlayer } from '~/redux/player/selectors';
import { connect } from 'react-redux';
import * as PLAYER_ACTIONS from '~/redux/player/actions';
import { Icon } from '~/components/input/Icon';

const mapStateToProps = state => ({
  youtubes: selectPlayer(state).youtubes,
});

const mapDispatchToProps = {
  playerGetYoutubeInfo: PLAYER_ACTIONS.playerGetYoutubeInfo,
};

type Props = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps &
  ICommentBlockProps & {};

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

    useEffect(() => {
      if (!link[5] || youtubes[link[5]]) return;
      playerGetYoutubeInfo(link[5]);
    }, [link, playerGetYoutubeInfo]);

    const title = useMemo(
      () =>
        (youtubes[link[5]] && youtubes[link[5]].metadata && youtubes[link[5]].metadata.title) || '',
      [link, youtubes]
    );

    return (
      <div className={styles.embed}>
        <a href={link[0]} target="_blank" />

        <div className={styles.preview}>
          <div style={{ backgroundImage: `url("${preview}")` }}>
            <div className={styles.backdrop}>
              <div className={styles.play}>
                <Icon icon="play" size={32} />
              </div>

              <div className={styles.title}>{title || link[0]}</div>
            </div>
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
