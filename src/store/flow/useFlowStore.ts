import { useStore } from '~/utils/context/StoreContextProvider';

export const useFlowStore = () => useStore().flow;
