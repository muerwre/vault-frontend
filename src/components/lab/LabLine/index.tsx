import React, { FC } from 'react';
import styles from './styles.module.scss';
import { INodeComponentProps } from '~/redux/node/constants';
import { useColorGradientFromString } from '~/hooks/color/useColorGradientFromString';

interface Props extends INodeComponentProps {}

const LabLine: FC<Props> = ({ node: { title } }) => {
  const background = useColorGradientFromString(title, 5, 3, 270);

  return <div className={styles.line} style={{ background }} />;
};

export { LabLine };
