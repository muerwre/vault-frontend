import React, { FC, useMemo } from 'react';

import classNames from 'classnames';

import { INodeComponentProps } from '~/constants/node';
import { useColorGradientFromString } from '~/hooks/color/useColorGradientFromString';
import markdown from '~/styles/common/markdown.module.scss';
import { formatTextParagraphs } from '~/utils/dom';
import { path } from '~/utils/ramda';

import styles from './styles.module.scss';

interface IProps extends INodeComponentProps {}

const NodeTextBlock: FC<IProps> = ({ node }) => {
  const content = useMemo(() => formatTextParagraphs(path(['blocks', 0, 'text'], node) || ''), [
    node,
  ]);

  const background = useColorGradientFromString(node.title, 3, 2);

  return (
    <div
      className={classNames(styles.text, markdown.wrapper)}
      style={{ background }}
      dangerouslySetInnerHTML={{
        __html: content,
      }}
    />
  );
};

export { NodeTextBlock };
