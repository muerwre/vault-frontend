import React, { FC, memo, useMemo, useEffect } from 'react';
import { ICommentBlockProps } from '~/constants/comment';
import styles from './styles.module.scss';
import { getYoutubeThumb } from '~/utils/dom';
import { selectPlayer } from '~/redux/player/selectors';
import { connect } from 'react-redux';
import * as PLAYER_ACTIONS from '~/redux/player/actions';
import { Icon } from '~/components/input/Icon';
import { path } from 'ramda';

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
    const id = useMemo(() => {
      const match = block.content.match(
        /https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch)?(?:\?v=)?([\w\-\=]+)/
      );

      return (match && match[1]) || '';
    }, [block.content]);

    const url = useMemo(() => `https://youtube.com/watch?v=${id}`, [id]);

    const preview = useMemo(() => getYoutubeThumb(block.content), [block.content]);

    useEffect(() => {
      if (!id) return;
      playerGetYoutubeInfo(id);
    }, [id, playerGetYoutubeInfo]);

    const title = useMemo<string>(() => {
      if (!id) {
        return block.content;
      }

      return path([id, 'metadata', 'title'], youtubes) || block.content;
    }, [id, youtubes, block.content]);

    return (
      <div className={styles.embed}>
        <a href={url} target="_blank" />

        <div className={styles.preview}>
          <div style={{ backgroundImage: `url("${preview}")` }}>
            <div className={styles.backdrop}>
              <div className={styles.play}>
                <Icon icon="play" size={32} />
              </div>

              <div className={styles.title}>{title}</div>
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
