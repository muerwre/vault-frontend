import { FC, useCallback, useMemo } from 'react';

import { Group } from '~/components/common/Group';
import { SubTitle } from '~/components/common/SubTitle';
import { Tags } from '~/containers/tags/Tags';
import { useNodeFormContext } from '~/hooks/node/useNodeFormFormik';
import { ITag } from '~/types';

/**
 * The post's tags, as on the post itself, but kept in the form: nothing is
 * sent until the post is saved, when they are matched or created by title.
 * Tags not saved yet get negative ids, so they can be deleted like the rest.
 */
const SubmitTags: FC = () => {
  const { values, setFieldValue } = useNodeFormContext();
  const tags = useMemo(() => values.tags || [], [values.tags]);

  const onChange = useCallback(
    (titles: string[]) => {
      let tempId = Math.min(0, ...tags.map((it) => it.ID)) - 1;

      setFieldValue(
        'tags',
        titles.map(
          (title) =>
            tags.find((it) => it.title === title) ??
            ({ ID: tempId--, title } as ITag),
        ),
      );
    },
    [tags, setFieldValue],
  );

  const onDelete = useCallback(
    (id: ITag['ID']) =>
      setFieldValue(
        'tags',
        tags.filter((it) => it.ID !== id),
      ),
    [tags, setFieldValue],
  );

  return (
    <Group>
      <SubTitle>Теги</SubTitle>

      <Tags
        tags={tags}
        editable
        deletable
        onTagsChange={onChange}
        onTagDelete={onDelete}
      />
    </Group>
  );
};

export { SubmitTags };
