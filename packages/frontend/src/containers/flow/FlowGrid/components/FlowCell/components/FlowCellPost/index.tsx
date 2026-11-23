import { FC, MouseEvent, useEffect, useMemo, useRef, useState } from 'react';

import classNames from 'classnames';

import { AudioList } from '~/components/common/AudioList';
import { Markdown } from '~/components/common/Markdown';
import { useAskToLogIn } from '~/hooks/auth/useAskToLogIn';
import { IFile } from '~/types';
import { getPhotoShade } from '~/utils/color';

import { FlowCellImage } from '../FlowCellImage';

import styles from './styles.module.scss';

interface Props {
  title: string;
  /** Left out, the panel holds the title alone, and songs if any. */
  text?: string;
  /** A song post's tracks, playable here, under its text. */
  songs?: IFile[];
  image?: string;
  color?: string;
}

/**
 * The cell is a link, so a click on its songs is kept from opening the post,
 * and a click on a song outside its controls plays it. Runs while capturing:
 * the player's own handlers stop the click before it bubbles, and the link
 * skips a cancelled one.
 */
const onSongsClick = (event: MouseEvent) => {
  event.preventDefault();

  const target = event.target as HTMLElement;

  if (target.closest('[data-audio-play], [data-audio-seek]')) {
    return;
  }

  target
    .closest('[data-audio-row]')
    ?.querySelector<HTMLElement>('[data-audio-play]')
    ?.click();
};

/**
 * A text or song post in the flow, laid out like its lab card: the photo
 * fills the cell, or the cell's own colour does, and the title and text sit
 * on a tinted panel at the bottom. Short text leaves the photo showing above
 * it; long text grows to the whole cell and fades out where it is cut.
 */
const FlowCellPost: FC<Props> = ({ title, text, songs, image, color }) => {
  const textRef = useRef<HTMLDivElement>(null);
  const askToLogIn = useAskToLogIn('song');
  const [isCut, setIsCut] = useState(false);

  // the fade is only for text that does not fit, as the cell resizes too
  useEffect(() => {
    const element = textRef.current;

    if (!element) {
      return;
    }

    const measure = () =>
      setIsCut(element.scrollHeight > element.clientHeight + 1);

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(element);

    return () => observer.disconnect();
  }, [text, songs]);

  // as on a lab card
  const backdrop = useMemo(
    () => (image ? getPhotoShade(color) : undefined),
    [image, color],
  );

  return (
    <div className={styles.wrap}>
      {!!image && (
        <FlowCellImage
          src={image}
          className={styles.image}
          style={{ backgroundColor: color }}
        />
      )}

      <div
        className={classNames(styles.panel, { [styles.over]: !!image })}
        style={backdrop}
      >
        <h4 className={styles.title}>{title}</h4>

        {(!!text || !!songs?.length) && (
          <div
            ref={textRef}
            className={classNames(styles.text, { [styles.cut]: isCut })}
          >
            {!!text && <Markdown>{text}</Markdown>}

            {!!songs?.length && (
              <div className={styles.players} onClickCapture={onSongsClick}>
                <AudioList
                  files={songs}
                  className={styles.songs}
                  onDisabledPlayPress={askToLogIn}
                  compact
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export { FlowCellPost };
