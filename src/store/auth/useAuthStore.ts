import { useStore } from '~/utils/context/StoreContextProvider';

export const useAuthStore = () => useStore().auth;
