import { useShallowSelect } from '~/hooks/data/useShallowSelect';
import { selectUser } from '~/redux/auth/selectors';

export const useUser = () => useShallowSelect(selectUser);
