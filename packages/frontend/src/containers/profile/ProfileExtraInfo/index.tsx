import { FC, Fragment } from 'react';

import type { IProfileInfoItem } from '@vault/common/types';

import { linkify } from '~/utils/linkify';

import styles from './styles.module.scss';

interface Props {
  info?: IProfileInfoItem[];
}

/** One entry: its title, then its value with any links made clickable. */
const ProfileExtraInfoItem: FC<{ item: IProfileInfoItem }> = ({ item }) => (
  <div className={styles.item}>
    {!!item.title && <div className={styles.title}>{item.title}</div>}

    <div className={styles.value}>
      {linkify(item.value).map((part, index) =>
        part.type === 'link' ? (
          <a
            key={index}
            className={styles.link}
            href={part.href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            title={part.href}
          >
            {part.text}
          </a>
        ) : (
          <Fragment key={index}>{part.text}</Fragment>
        ),
      )}
    </div>
  </div>
);

/** A profile's additional info as a list. Edited in the settings. */
const ProfileExtraInfo: FC<Props> = ({ info = [] }) => {
  if (!info.length) {
    return null;
  }

  return (
    <div className={styles.list}>
      {info.map((item, index) => (
        <ProfileExtraInfoItem key={index} item={item} />
      ))}
    </div>
  );
};

export { ProfileExtraInfo, ProfileExtraInfoItem };
