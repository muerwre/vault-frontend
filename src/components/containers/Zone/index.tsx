import React, { FC } from "react";

import classNames from "classnames";

import styles from "./styles.module.scss";

interface ZoneProps {
  title?: string;
  className?: string;
  color?: "danger" | "normal";
}

const Zone: FC<ZoneProps> = ({
  title,
  className,
  children,
  color = "normal",
}) => (
  <div className={classNames(className, styles.pad, styles[color])}>
    {!!title && (
      <div className={styles.title}>
        <span>{title}</span>
      </div>
    )}
    {children}
  </div>
);

export { Zone };
