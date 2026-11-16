import { useCallback } from 'react';

import { SidebarName } from '~/constants/sidebar';
import { useSidebar } from '~/utils/providers/SidebarProvider';

export const useTagSidebar = () => {
  const { open } = useSidebar();

  return useCallback(
    (tag: string, options?: { lab?: boolean }) => {
      if (!tag) {
        return;
      }

      open(SidebarName.Tag, {
        tag,
        feature: options?.lab ? 'lab' : undefined,
      });
    },
    [open],
  );
};
