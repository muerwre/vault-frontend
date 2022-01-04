import { useStore } from '~/utils/context/StoreContextProvider';

export const useModalStore = () => useStore().modal;
