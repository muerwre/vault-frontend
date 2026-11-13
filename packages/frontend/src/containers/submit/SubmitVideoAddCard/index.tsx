import { FC, KeyboardEvent, useCallback, useState } from 'react';

import classNames from 'classnames';

import { Button } from '~/components/input/Button';
import { InputText } from '~/components/input/InputText';
import { Textarea } from '~/components/input/Textarea';
import { IBlock } from '~/types';
import { getYoutubeId } from '~/utils/dom';

import { SubmitCard } from '../SubmitCard';

import styles from './styles.module.scss';

interface Props {
  /** Ids of videos already listed; links to them are skipped. */
  existing: string[];
  onAdd: (blocks: IBlock[]) => void;
  /**
   * A card with a textarea, for the end of the list; or a bare input and
   * button, for the empty zone before the first video.
   */
  variant?: 'card' | 'inline';
  className?: string;
}

/**
 * Takes YouTube links, several at once if need be, and adds the ones not
 * listed yet. Enter adds; Shift+Enter breaks the line.
 */
const SubmitVideoAddCard: FC<Props> = ({
  existing,
  onAdd,
  variant = 'card',
  className,
}) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const onUrlChange = useCallback((value: string) => {
    setUrl(value);
    setError('');
  }, []);

  const add = useCallback(() => {
    const links = url
      .split(/\s+/)
      .map((it) => ({ url: it, id: getYoutubeId(it) }))
      .filter((it): it is { url: string; id: string } => !!it.id);

    if (!links.length) {
      setError('Это не похоже на ссылку на ютуб');
      return;
    }

    const seen = new Set(existing);
    const blocks: IBlock[] = [];

    links.forEach((it) => {
      if (seen.has(it.id)) {
        return;
      }

      seen.add(it.id);
      blocks.push({ type: 'video', url: it.url });
    });

    if (!blocks.length) {
      setError('Это видео уже добавлено');
      return;
    }

    onAdd(blocks);
    setUrl('');
  }, [url, existing, onAdd]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (event.key !== 'Enter' || event.shiftKey) {
        return;
      }

      event.preventDefault();
      add();
    },
    [add],
  );

  if (variant === 'inline') {
    return (
      <div className={classNames(styles.inline, className)}>
        <div className={styles.input}>
          <InputText
            value={url}
            handler={onUrlChange}
            onKeyDown={onKeyDown}
            placeholder="Ссылка на ютуб"
            error={error}
            autoFocus
          />
        </div>

        <Button type="button" onClick={add} iconLeft="plus" round>
          Добавить
        </Button>
      </div>
    );
  }

  return (
    <SubmitCard className={classNames(styles.add, className)}>
      <div className={styles.field}>
        <Textarea
          value={url}
          handler={onUrlChange}
          onKeyDown={onKeyDown}
          placeholder="Ссылка на ютуб"
          error={error}
          minRows={2}
          className={styles.textarea}
        />
      </div>

      <Button
        type="button"
        onClick={add}
        iconLeft="plus"
        size="small"
        className={styles.button}
      >
        Добавить
      </Button>
    </SubmitCard>
  );
};

export { SubmitVideoAddCard };
