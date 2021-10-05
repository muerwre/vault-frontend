import React, { FC, useMemo } from 'react';
import styles from './styles.module.scss';
import { DEFAULT_DOMINANT_COLOR } from '~/constants/node';
import { convertHexToRGBA } from '~/utils/color';
import { DivProps } from '~/utils/types';
import classNames from 'classnames';

interface Props extends DivProps {
  color?: string;
}

const CellShade: FC<Props> = ({ color, ...rest }) => {
  const background = useMemo(() => {
    if (!color || color === DEFAULT_DOMINANT_COLOR) {
      return undefined;
    }

    return `linear-gradient(10deg, ${color} 30px, ${convertHexToRGBA(color, 0.3)} 200px)`;
  }, [color]);

  return (
    <div {...rest} className={classNames(rest.className, styles.shade)} style={{ background }} />
  );
};

export { CellShade };
