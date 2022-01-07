import React, { AllHTMLAttributes, FC } from "react";
import styles from "./styles.module.scss";
import classNames from "classnames";

type IProps = AllHTMLAttributes<HTMLDivElement> & { is_blurred: boolean };

export const BlurWrapper: FC<IProps> = ({ children, is_blurred }) => (
  <div className={classNames(styles.blur, { [styles.is_blurred]: is_blurred })}>{children}</div>
);
