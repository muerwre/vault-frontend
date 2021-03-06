import { useShallowSelect } from '~/utils/hooks/useShallowSelect';
import { selectUser } from '~/redux/auth/selectors';

export const useUser = () => useShallowSelect(selectUser);
