import React, { VFC } from 'react';

import classNames from 'classnames';

import { useScrollHeight } from '~/hooks/dom/useScrollHeight';
import { useScrollToBottom } from '~/hooks/dom/useScrollToBottom';
import { useScrollTop } from '~/hooks/dom/useScrollTop';

import styles from './styles.module.scss';

interface ScrollHelperBottomProps {}

const ScrollHelperBottom: VFC<ScrollHelperBottomProps> = () => {
  const top = useScrollTop();
  const scrollHeight = useScrollHeight();
  const scrollToBottom = useScrollToBottom();

  const isVisible = scrollHeight > 2000 && top < scrollHeight * 0.25;

  return (
    <div
      className={classNames(styles.helper, { [styles.visible]: isVisible })}
      onClick={scrollToBottom}
    >
      Вниз
    </div>
  );
};

export { ScrollHelperBottom };
