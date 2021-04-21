import React, { FC, useMemo } from 'react';
import { Placeholder, PlaceholderProps } from '~/components/placeholders/Placeholder';
import styles from './styles.module.scss';
import { Group } from '~/components/containers/Group';

type Props = PlaceholderProps & {
  lines?: number;
  wordsLimit?: number;
};

const Paragraph: FC<Props> = ({ lines = 3, wordsLimit = 12, ...props }) => {
  const iters = useMemo(
    () =>
      [...new Array(lines)].map(() =>
        [...new Array(Math.ceil(Math.random() * wordsLimit))].map((_, i) => i)
      ),
    [lines, wordsLimit]
  );

  console.log({ iters });

  return (
    <Group>
      {iters.map(words => (
        <div className={styles.para}>
          {words.map(word => (
            <Placeholder key={word} width={`${Math.round(Math.random() * 120) + 60}px`} active />
          ))}
        </div>
      ))}
    </Group>
  );
};

export { Paragraph };
