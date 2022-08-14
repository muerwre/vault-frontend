import React, { FC } from 'react';

import classNames from 'classnames';

import { Card } from '~/components/containers/Card';
import { Group } from '~/components/containers/Group';
import { Theme, themeColors } from '~/constants/themes';
import { useTheme } from '~/utils/providers/ThemeProvider';

import styles from './styles.module.scss';

interface ThemeSwitcherProps {}

const ThemeSwitcher: FC<ThemeSwitcherProps> = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Group horizontal>
      {Object.entries(themeColors).map(([id, item]) => (
        <Card
          key={id}
          className={classNames(styles.card, {
            [styles.active]: theme === id,
          })}
          style={{ background: item.background }}
          role="button"
          onClick={() => setTheme(id as Theme)}
        >
          <Group>
            <Group horizontal>
              {item.colors.map((color) => (
                <div
                  key={color}
                  className={styles.sample}
                  style={{ background: color }}
                />
              ))}
            </Group>
            <div className={styles.title}>{item.name}</div>
          </Group>
        </Card>
      ))}
    </Group>
  );
};

export { ThemeSwitcher };
