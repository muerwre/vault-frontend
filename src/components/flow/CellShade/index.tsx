import React, { FC, useMemo } from 'react';

import classNames from 'classnames';
import { transparentize } from 'color2k';

import { DEFAULT_DOMINANT_COLOR } from '~/constants/node';
import { normalizeBrightColor } from '~/utils/color';
import { DivProps } from '~/utils/types';

import styles from './styles.module.scss';

interface Props extends DivProps {
  color?: string;
  size?: number;
}

const CellShade: FC<Props> = ({ color, size = 50, ...rest }) => {
  const background = useMemo(() => {
    const normalized = normalizeBrightColor(color);

    if (!color || color === DEFAULT_DOMINANT_COLOR || !normalized) {
      return undefined;
    }

    return `linear-gradient(7deg, ${normalized} ${size}px, ${transparentize(normalized, 1)} ${size *
      5}px)`;
  }, [color, size]);

  return (
    <div {...rest} className={classNames(rest.className, styles.shade)} style={{ background }} />
  );
};

export { CellShade };
