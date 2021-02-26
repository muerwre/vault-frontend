import React, { FC, useCallback } from 'react';
import { ButtonGroup } from '~/components/input/ButtonGroup';
import { Button } from '~/components/input/Button';
import { useFormatWrapper } from '~/utils/hooks/useFormatWrapper';
import styles from './styles.module.scss';

interface IProps {
  element: HTMLTextAreaElement;
  handler: (val: string) => void;
}

const CommentFormFormatButtons: FC<IProps> = ({ element, handler }) => {
  const wrap = useCallback(
    (prefix = '', suffix = '') => useFormatWrapper(element, handler, prefix, suffix),
    [element, handler]
  );

  return (
    <ButtonGroup className={styles.wrap}>
      <Button
        onClick={wrap('**', '**')}
        iconLeft="bold"
        size="small"
        color="gray"
        iconOnly
        type="button"
      />

      <Button
        onClick={wrap('*', '*')}
        iconLeft="italic"
        size="small"
        color="gray"
        iconOnly
        type="button"
      />

      <Button
        onClick={wrap('## ', '')}
        iconLeft="title"
        size="small"
        color="gray"
        iconOnly
        type="button"
      />

      <Button
        onClick={wrap('[ссылка](', ')')}
        iconLeft="link"
        size="small"
        color="gray"
        iconOnly
        type="button"
      />
    </ButtonGroup>
  );
};

export { CommentFormFormatButtons };
