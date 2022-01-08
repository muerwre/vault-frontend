import React, { FC } from "react";
import { IMessage } from "~/redux/types";
import styles from "./styles.module.scss";
import { formatText, getPrettyDate, getURL } from "~/utils/dom";
import { PRESETS } from "~/constants/urls";
import classNames from "classnames";
import { Group } from "~/components/containers/Group";
import markdown from "~/styles/common/markdown.module.scss";

interface IProps {
  message: IMessage;
  incoming: boolean;
}

const Message: FC<IProps> = ({ message, incoming }) => {
  return (
    <div className={classNames(styles.message, { [styles.incoming]: incoming })}>
      <div className={styles.text}>
        <Group
          dangerouslySetInnerHTML={{ __html: formatText(message.text) }}
          className={markdown.wrapper}
        />
      </div>

      <div
        className={styles.avatar}
        style={{ backgroundImage: `url("${getURL(message.from.photo, PRESETS.avatar)}")` }}
      />

      <div className={styles.stamp}>{getPrettyDate(message.created_at)}</div>
    </div>
  );
};
export { Message };
