import { createElement, FC, useCallback, useMemo } from 'react';

import { NodeComponentProps } from '~/constants/node';
import { INode } from '~/types';
import { isNil, prop } from '~/utils/ramda';

import { LAB_PREVIEW_LAYOUT } from '../constants';

// useNodeBlocks returns head, block and inline blocks of node
export const useLabNodeBlocks = (node: INode, isLoading: boolean) => {
  const createBlock = useCallback(
    (block?: FC<NodeComponentProps>, key = 0) =>
      !isNil(block) &&
      createElement(block, {
        node,
        isLoading,
        key: `${node.id}-${key}`,
      }),
    [node, isLoading],
  );

  return useMemo(
    () =>
      node?.type && prop(node.type, LAB_PREVIEW_LAYOUT)
        ? prop(node.type, LAB_PREVIEW_LAYOUT).map((comp, i) =>
            createBlock(comp, i),
          )
        : undefined,
    [node, createBlock],
  );
};
