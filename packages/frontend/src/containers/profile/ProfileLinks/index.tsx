import { FC } from 'react';

import styles from './styles.module.scss';

/** `https://www.vk.com/id1/` → `vk.com/id1` */
const prettifyLink = (link: string) =>
  link
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/$/, '');

interface Props {
  links?: string[];
}

/** Profile links. They are edited in the settings sidebar. */
const ProfileLinks: FC<Props> = ({ links = [] }) => {
  if (!links.length) {
    return null;
  }

  return (
    <div className={styles.list}>
      {links.map((link) => (
        <a
          key={link}
          className={styles.link}
          href={link}
          target="_blank"
          rel="noopener noreferrer nofollow"
          title={link}
        >
          {prettifyLink(link)}
        </a>
      ))}
    </div>
  );
};

export { ProfileLinks };
