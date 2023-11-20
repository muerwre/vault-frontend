import { FC } from 'react';

import { NodeComponentProps } from '~/constants/node';
import { useColorGradientFromString } from '~/hooks/color/useColorGradientFromString';

import styles from './styles.module.scss';

interface Props extends NodeComponentProps {}

const LabLine: FC<Props> = ({ node: { title } }) => {
  const background = useColorGradientFromString(title, 5, 3, 270);

  return <div className={styles.line} style={{ background }} />;
};

export { LabLine };
