import React, { FC } from 'react';
import styles from './/styles.module.scss';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { ITag } from '~/types';
import { Tag } from '~/components/tags/Tag';

interface IProps {
  tags: ITag[];
  isLoading: boolean;
}

const LabTags: FC<IProps> = ({ tags, isLoading }) => {
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
      {tags.slice(0, 10).map(tag => (
        <Tag tag={tag} key={tag.ID} />
      ))}
    </div>
  );
};

export { LabTags };
