import React, { FC, useCallback, useEffect } from 'react';

import { Button } from '~/components/input/Button';
import { ButtonGroup } from '~/components/input/ButtonGroup';
import { useFormatWrapper, wrapTextInsideInput } from '~/hooks/dom/useFormatWrapper';

import styles from './styles.module.scss';

interface IProps {
  element: HTMLTextAreaElement;
  handler: (val: string) => void;
}

const CommentFormFormatButtons: FC<IProps> = ({ element, handler }) => {
  const wrapper = useFormatWrapper(handler);

  const wrap = useCallback((prefix = '', suffix = '') => wrapper(element, prefix, suffix), [
    element,
    wrapper,
  ]);

  const wrapBold = useCallback(
    event => {
      event.preventDefault();
      wrapTextInsideInput(element, '**', '**', handler);
    },
    [element, handler]
  );

  const wrapItalic = useCallback(
    event => {
      event.preventDefault();
      wrapTextInsideInput(element, '*', '*', handler);
    },
    [element, handler]
  );

  const onKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!event.ctrlKey) return;

      if (event.code === 'KeyB') {
        wrapBold(event);
      }

      if (event.code === 'KeyI') {
        wrapItalic(event);
      }
    },
    [wrapBold, wrapItalic]
  );

  useEffect(() => {
    if (!element) {
      return;
    }

    element.addEventListener('keypress', onKeyPress);

    return () => element.removeEventListener('keypress', onKeyPress);
  }, [element, onKeyPress]);

  return (
    <ButtonGroup className={styles.wrap}>
      <Button
        onClick={wrapBold}
        iconLeft="bold"
        size="small"
        color="gray"
        iconOnly
        type="button"
        label="Жирный Ctrl+B"
        className={styles.button}
      />

      <Button
        onClick={wrap('*', '*')}
        iconLeft="italic"
        size="small"
        color="gray"
        iconOnly
        type="button"
        label="Наклонный Ctrl+I"
        className={styles.button}
      />

      <Button
        onClick={wrap('## ', '')}
        iconLeft="title"
        size="small"
        color="gray"
        iconOnly
        type="button"
        label="Заголовок"
        className={styles.button}
      />

      <Button
        onClick={wrap('[ссылка](', ')')}
        iconLeft="link"
        size="small"
        color="gray"
        iconOnly
        type="button"
        label="Ссылка"
        className={styles.button}
      />

      <Button
        onClick={wrap('// ')}
        size="small"
        color="gray"
        iconOnly
        type="button"
        label="Коммент"
        className={styles.button}
      >
        {`/ /`}
      </Button>
    </ButtonGroup>
  );
};

export { CommentFormFormatButtons };
