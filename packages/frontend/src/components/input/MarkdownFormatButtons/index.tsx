import { FC, MouseEvent } from 'react';

import classNames from 'classnames';
import { BoldIcon, Heading2Icon, ItalicIcon, Link2Icon } from 'lucide-react';

import { Button } from '~/components/input/Button';
import { ButtonGroup } from '~/components/input/ButtonGroup';
import { MarkdownFormatter } from '~/components/input/MarkdownEditor';

import styles from './styles.module.scss';

interface Props {
  formatter: MarkdownFormatter;
  /** Offers heading levels instead of a single heading button. */
  headings?: boolean;
  className?: string;
}

const HEADING_LEVELS = [1, 2, 3];

const MarkdownFormatButtons: FC<Props> = ({
  formatter,
  headings,
  className,
}) => {
  const run = (action: () => void) => (event: MouseEvent) => {
    event.preventDefault();
    action();
  };

  return (
    <ButtonGroup className={classNames(styles.wrap, className)}>
      <Button
        onClick={run(() => formatter.wrap('**', '**'))}
        iconLeft={<BoldIcon size={16} />}
        size="small"
        color="gray"
        iconOnly
        type="button"
        label="Жирный Ctrl+B"
        className={styles.button}
      />

      <Button
        onClick={run(() => formatter.wrap('*', '*'))}
        iconLeft={<ItalicIcon size={16} />}
        size="small"
        color="gray"
        iconOnly
        type="button"
        label="Наклонный Ctrl+I"
        className={styles.button}
      />

      {headings ? (
        HEADING_LEVELS.map((level) => (
          <Button
            key={level}
            onClick={run(() => formatter.setHeading(level))}
            size="small"
            color="gray"
            iconOnly
            type="button"
            label={`Заголовок ${level}`}
            className={styles.button}
          >
            {`H${level}`}
          </Button>
        ))
      ) : (
        <Button
          onClick={run(() => formatter.setHeading(2))}
          iconLeft={<Heading2Icon size={16} />}
          size="small"
          color="gray"
          iconOnly
          type="button"
          label="Заголовок"
          className={styles.button}
        />
      )}

      <Button
        onClick={run(() => formatter.wrap('[ссылка](', ')'))}
        iconLeft={<Link2Icon size={16} />}
        size="small"
        color="gray"
        iconOnly
        type="button"
        label="Ссылка"
        className={styles.button}
      />

      <Button
        onClick={run(() => formatter.wrap('// '))}
        size="small"
        color="gray"
        iconOnly
        type="button"
        label="Коммент"
        className={styles.button}
      >
        {'/ /'}
      </Button>
    </ButtonGroup>
  );
};

export { MarkdownFormatButtons };
