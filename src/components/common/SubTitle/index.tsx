import { FC } from 'react';

import classNames from 'classnames';

import { Placeholder } from '~/components/placeholders/Placeholder';
import { DivProps } from '~/utils/types';

import styles from './styles.module.scss';

interface Props extends DivProps {
  isLoading?: boolean;
}

const SubTitle: FC<Props> = ({ isLoading, children, ...rest }) => (
  <div {...rest} className={classNames(styles.title, rest.className)}>
    <Placeholder active={isLoading} loading>
      {children}
    </Placeholder>
  </div>
);

export { SubTitle };
