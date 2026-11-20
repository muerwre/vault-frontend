import { useCallback } from 'react';

import { MAX_LIST_SONGS } from '@vault/common/constants';

import { apiPostNode } from '~/api/node';
import { NODE_TYPES } from '~/constants/node';
import { UploadType } from '~/constants/uploads';
import { useGetLabNodes } from '~/hooks/lab/useGetLabNodes';
import { useLoadNode } from '~/hooks/node/useLoadNode';
import { useFlowStore } from '~/store/flow/useFlowStore';
import { INode } from '~/types';

export const useUpdateNode = (id: number) => {
  const { update } = useLoadNode(id);
  const flow = useFlowStore();
  const lab = useGetLabNodes();

  return useCallback(
    async (node: INode) => {
      const result = await apiPostNode({ node });

      if (!update) {
        return;
      }

      await update(result.node);

      if (node.is_promoted) {
        // the flow brings a song node's first songs, which the edit may change
        flow.updateNode(result.node.id!, {
          ...result.node,
          songs:
            result.node.type === NODE_TYPES.AUDIO
              ? result.node.files
                  .filter((file) => file?.type === UploadType.Audio)
                  .slice(0, MAX_LIST_SONGS)
              : undefined,
        });
      } else {
        await lab.updateNode(result.node.id!, result.node);
      }
    },
    [update, flow, lab],
  );
};
