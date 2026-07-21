import { ITag } from '~/types';

export const separateTags = (tags: Partial<ITag>[]): Partial<ITag>[][] =>
  (tags || []).reduce(
    (obj, tag) =>
      tag?.title?.substr(0, 1) === '/'
        ? [[...obj[0], tag], obj[1]]
        : [obj[0], [...obj[1], tag]],
    [[], []] as Partial<ITag>[][],
  );

export const separateTagOptions = (options: string[]): string[][] =>
  separateTags(options.map((title): Partial<ITag> => ({ title }))).map((item) =>
    item.filter((tag) => tag.title).map(({ title }) => title!),
  );
