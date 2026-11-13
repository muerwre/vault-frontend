import { useCallback } from 'react';

import { SidebarName } from '~/constants/sidebar';
import { useSidebar } from '~/utils/providers/SidebarProvider';

export const useTagSidebar = () => {
  const { open } = useSidebar();

  return useCallback(
    (tag: string) => {
      if (!tag) {
        return;
      }

      open(SidebarName.Tag, { tag });
    },
    [open],
  );
};
