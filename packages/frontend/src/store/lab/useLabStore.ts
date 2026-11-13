import { useStore } from '~/utils/context/StoreContextProvider';

export const useLabStore = () => useStore().lab;
