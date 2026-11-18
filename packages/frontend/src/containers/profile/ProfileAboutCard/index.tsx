import { FC, FormEvent, useCallback, useState } from 'react';

import classNames from 'classnames';

import { Card } from '~/components/common/Card';
import { Filler } from '~/components/common/Filler';
import { Icon } from '~/components/common/Icon';
import { Markdown } from '~/components/common/Markdown';
import { Button } from '~/components/input/Button';
import { useSaveProfile } from '~/hooks/profile/useSaveProfile';
import { FlowDisplayVariant } from '~/types';
import { IUser } from '~/types/auth';

import styles from './styles.module.scss';

/** Size of a card with text when its owner never picked one. */
export const DEFAULT_ABOUT_DISPLAY: FlowDisplayVariant = 'horizontal';

const SIZES: Array<{
  display: FlowDisplayVariant;
  icon: string;
  title: string;
}> = [
  { display: 'single', icon: 'cell-single', title: 'Маленький' },
  { display: 'horizontal', icon: 'cell-double-h', title: 'Широкий' },
  { display: 'vertical', icon: 'cell-double-v', title: 'Высокий' },
  { display: 'quadro', icon: 'cell-quadro', title: 'Большой' },
];

interface Props {
  about: string;
  /** As saved; empty when never picked. */
  display: FlowDisplayVariant | '';
  /** Grid placement for each size, owned by the page grid. */
  sizeClassNames: Record<FlowDisplayVariant, string>;
  className?: string;
  /** Shown instead of an empty text. */
  placeholder: string;
  canEdit: boolean;
  onSaved: (user: Partial<IUser>) => Promise<void> | void;
}

/**
 * The big card of the profile page. An empty one shrinks to a single cell
 * whatever size was saved; while editing, the size being picked is previewed.
 */
const ProfileAboutCard: FC<Props> = ({
  about,
  display,
  sizeClassNames,
  className,
  placeholder,
  canEdit,
  onSaved,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState('');
  const [pendingDisplay, setPendingDisplay] = useState<FlowDisplayVariant>(
    DEFAULT_ABOUT_DISPLAY,
  );
  const [error, setError] = useState('');
  const { submit, isSaving } = useSaveProfile(onSaved);

  const startEditing = useCallback(() => {
    setText(about);
    setPendingDisplay(display || DEFAULT_ABOUT_DISPLAY);
    setError('');
    setIsEditing(true);
  }, [about, display]);

  const stopEditing = useCallback(() => setIsEditing(false), []);

  const onSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();

      const errors = await submit({
        about: text,
        about_display: pendingDisplay,
      });

      if (!errors) {
        setIsEditing(false);
        return;
      }

      setError(errors.about || errors.about_display || '');
    },
    [submit, text, pendingDisplay],
  );

  const shownDisplay: FlowDisplayVariant = isEditing
    ? pendingDisplay
    : about
      ? display || DEFAULT_ABOUT_DISPLAY
      : 'single';

  return (
    <div
      className={classNames(
        styles.wrap,
        sizeClassNames[shownDisplay],
        className,
      )}
    >
      <Card className={styles.card}>
        {isEditing ? (
          <form className={styles.form} onSubmit={onSubmit}>
            <textarea
              className={styles.textarea}
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Расскажите о себе. Можно использовать markdown"
              autoFocus
            />

            {!!error && <div className={styles.error}>{error}</div>}

            <div className={styles.footer}>
              <div className={styles.sizes}>
                {SIZES.map((size) => (
                  <button
                    key={size.display}
                    type="button"
                    title={size.title}
                    className={classNames(styles.size, {
                      [styles.active]: size.display === pendingDisplay,
                    })}
                    onClick={() => setPendingDisplay(size.display)}
                  >
                    <Icon icon={size.icon} size={24} />
                  </button>
                ))}
              </div>

              <Filler />

              <Button
                type="button"
                color="gray"
                size="small"
                onClick={stopEditing}
              >
                Отмена
              </Button>
              <Button type="submit" size="small" disabled={isSaving}>
                Сохранить
              </Button>
            </div>
          </form>
        ) : (
          <>
            {canEdit && (
              <button
                type="button"
                className={styles.edit}
                onClick={startEditing}
                title="Изменить"
              >
                <Icon icon="edit" size={20} />
              </button>
            )}

            {about ? (
              <Markdown className={styles.content}>{about}</Markdown>
            ) : (
              <div className={styles.empty}>{placeholder}</div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export { ProfileAboutCard };
