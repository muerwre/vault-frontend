import { shallowEqual, useSelector } from 'react-redux';
import { IState } from '~/redux/store';

export const useShallowSelect = <T extends (state: IState) => any>(selector: T): ReturnType<T> =>
  useSelector(selector, shallowEqual);
