import React, { FC, useCallback, useState } from "react";
import { IUser } from "~/redux/auth/types";
import { Avatar } from "~/components/common/Avatar";
import { path } from "ramda";
import { Manager, Popper, Reference } from "react-popper";
import styles from "./styles.module.scss";
import { useRandomPhrase } from "~/constants/phrases";

interface Props {
  user: IUser;
  withDetails: boolean;
  className?: string;
}

const modifiers = [
  {
    name: 'offset',
    options: {
      offset: [0, 10],
    },
  },
];

const CommentAvatar: FC<Props> = ({ user, withDetails, className }) => {
  const [hovered, setHovered] = useState(false);
  const randomPhrase = useRandomPhrase('USER_DESCRIPTION');

  const onMouseOver = useCallback(() => setHovered(true), [setHovered]);
  const onMouseOut = useCallback(() => setHovered(false), [setHovered]);

  return (
    <Manager>
      <Reference>
        {({ ref }) => (
          <Avatar
            url={path(['photo', 'url'], user)}
            username={user.username}
            className={className}
            innerRef={ref}
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
          />
        )}
      </Reference>

      {hovered && withDetails && (
        <Popper placement="right" modifiers={modifiers}>
          {({ style, ref }) => (
            <div style={style} ref={ref} className={styles.popper}>
              <h4 className={styles.username}>{user.fullname || user.username}</h4>
              <div className={styles.description}>{user.description || randomPhrase}</div>
            </div>
          )}
        </Popper>
      )}
    </Manager>
  );
};

export { CommentAvatar };
