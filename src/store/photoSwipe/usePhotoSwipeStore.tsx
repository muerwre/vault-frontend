import { useStore } from '~/utils/context/StoreContextProvider';

export const usePhotoSwipeStore = () => useStore().photoSwipe;
