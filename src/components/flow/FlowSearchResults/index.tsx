import React, { FC } from 'react';
import styles from './styles.scss';
import { IFlowState } from '~/redux/flow/reducer';
import { LoaderCircle } from '~/components/input/LoaderCircle';

interface IProps {
  search: IFlowState['search'];
}

const FlowSearchResults: FC<IProps> = ({ search }) => {
  if (search.is_loading) {
    return (
      <div className={styles.loading}>
        <LoaderCircle size={64} />
      </div>
    );
  }
  return <div className={styles.wrap}>SEARCH</div>;
};

export { FlowSearchResults };
