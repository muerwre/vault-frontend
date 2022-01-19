import { useCallback, useState } from 'react';

import { runInAction } from 'mobx';
import { uniq } from 'ramda';

import { getNodeDiff } from '~/api/node';
import { useFlowStore } from '~/store/flow/useFlowStore';
import { showErrorToast } from '~/utils/errors/showToast';

export const useFlowLoader = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const flow = useFlowStore();

  /** Loads initial nodes and puts to store */
  const getInitialNodes = useCallback(async () => {
    try {
      setIsSyncing(true);

      const { before, after, heroes, recent, updated } = await getNodeDiff({
        start: new Date().toISOString(),
        end: new Date().toISOString(),
        with_heroes: true,
        with_updated: true,
        with_recent: true,
        with_valid: false,
      });

      runInAction(() => {
        flow.setNodes(uniq([...(before || []), ...(after || [])]));
        flow.setHeroes(heroes || []);
        flow.setUpdated(updated || []);
        flow.setRecent(recent || []);
        flow.setIsRefreshed(true);
      });
    } catch (error) {
      showErrorToast(error);
    } finally {
      setIsSyncing(false);
    }
  }, [flow]);

  /** Loads next nodes */
  const loadMore = useCallback(async () => {
    try {
      setIsSyncing(true);

      const start = flow.nodes[0].created_at;
      const end = flow.nodes[flow.nodes.length - 1] && flow.nodes[flow.nodes.length - 1].created_at;

      const data = await getNodeDiff({
        start,
        end,
        with_heroes: false,
        with_updated: true,
        with_recent: true,
        with_valid: true,
      });

      const nodes = uniq([
        ...(data.before || []),
        ...(data.valid ? flow.nodes.filter(node => data.valid.includes(node.id)) : flow.nodes),
        ...(data.after || []),
      ]);

      runInAction(() => {
        flow.setNodes(nodes);

        if (data.recent?.length) {
          flow.setRecent(data.recent);
        }

        if (data.updated?.length) {
          flow.setUpdated(data.updated);
        }
      });

      // wait a little to debounce
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      showErrorToast(error);
    } finally {
      setIsSyncing(false);
    }
  }, [flow]);

  return { getInitialNodes, isSyncing, loadMore };
};
