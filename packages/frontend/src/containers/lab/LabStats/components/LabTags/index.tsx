import { FC, useCallback } from 'react';

import { Placeholder } from '~/components/placeholders/Placeholder';
import { Tag } from '~/components/tags/Tag';
import { useTagSidebar } from '~/hooks/sidebar/useTagSidebar';
import { ITag } from '~/types';

import styles from './styles.module.scss';

interface Props {
  tags: ITag[];
  isLoading: boolean;
}

const LabTags: FC<Props> = ({ tags, isLoading }) => {
  const openTagSidebar = useTagSidebar();

  const onTagClick = useCallback(
    (tag: Partial<ITag>) => {
      if (!tag.title) {
        return;
      }

      openTagSidebar(tag.title, { lab: true });
    },
    [openTagSidebar],
  );

  if (isLoading) {
    return (
      <div className={styles.tags}>
        <Placeholder height={20} width="100px" />
        <Placeholder height={20} width="64px" />
        <Placeholder height={20} width="100%" />
        <Placeholder height={20} width="100px" />
        <Placeholder height={20} width="100px" />
        <Placeholder height={20} width="64px" />
      </div>
    );
  }

  return (
    <div className={styles.tags}>
      {tags.slice(0, 10).map((tag) => (
        <Tag tag={tag} key={tag.ID} onClick={onTagClick} />
      ))}
    </div>
  );
};

export { LabTags };
