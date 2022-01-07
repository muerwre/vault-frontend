import React, { FC, useMemo } from "react";
import { path } from "ramda";
import { formatTextParagraphs } from "~/utils/dom";
import { INodeComponentProps } from "~/constants/node";
import classNames from "classnames";
import styles from "./styles.module.scss";
import markdown from "~/styles/common/markdown.module.scss";

interface IProps extends INodeComponentProps {}

const NodeTextBlock: FC<IProps> = ({ node }) => {
  const content = useMemo(() => formatTextParagraphs(path(['blocks', 0, 'text'], node) || ''), [
    node,
  ]);

  return (
    <div
      className={classNames(styles.text, markdown.wrapper)}
      dangerouslySetInnerHTML={{
        __html: content,
      }}
    />
  );
};

export { NodeTextBlock };
