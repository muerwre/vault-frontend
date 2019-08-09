import React, { FC, HTMLAttributes } from 'react';
import { TagField } from '~/components/containers/TagField';
import { ITag } from '~/redux/types';
import { Tag } from '~/components/node/Tag';

type IProps = HTMLAttributes<HTMLDivElement> & {
  tags: ITag[];
}

export const Tags: FC<IProps> = ({
  tags,
  ...props
}) => (
  <TagField {...props}>
    {
      tags.map(tag => (
        <Tag
          key={tag.title}
          title={tag.title}
          feature={tag.feature}
        />
      ))
    }
  </TagField>
);
