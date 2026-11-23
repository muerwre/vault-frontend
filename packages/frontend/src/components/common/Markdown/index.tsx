import { DetailedHTMLProps, VFC, HTMLAttributes } from 'react';

import classNames from 'classnames';

import { useMentionClicks } from '~/hooks/navigation/useMentionClicks';
import styles from '~/styles/common/markdown.module.scss';
import { formatText } from '~/utils/dom';

interface Props
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  children?: string;
}

const Markdown: VFC<Props> = ({
  className,
  children = '',
  onClick,
  ...props
}) => {
  const onMentionClick = useMentionClicks();

  return (
    <div
      className={classNames(styles.wrapper, className)}
      {...props}
      onClick={(event) => {
        onMentionClick(event);
        onClick?.(event);
      }}
      dangerouslySetInnerHTML={{ __html: formatText(children) }}
    />
  );
};

export { Markdown };
