import { createElement, FC, useCallback, useMemo } from 'react';

import { INodeComponentProps, LAB_PREVIEW_LAYOUT, NODE_COMPONENTS, NODE_HEADS, NODE_INLINES } from '~/constants/node';
import { INode } from '~/types';
import { isNil, prop } from '~/utils/ramda';

// useNodeBlocks returns head, block and inline blocks of node
export const useNodeBlocks = (node: INode, isLoading: boolean) => {
  const createNodeBlock = useCallback(
    (block?: FC<INodeComponentProps>, key = 0) =>
      !isNil(block) &&
      createElement(block, {
        node,
        isLoading,
        key: `${node.id}-${key}`,
      }),
    [node, isLoading]
  );

  const head = useMemo(
    () => createNodeBlock(node?.type ? prop(node?.type, NODE_HEADS) : undefined),
    [node, createNodeBlock]
  );

  const block = useMemo(
    () => createNodeBlock(node?.type ? prop(node?.type, NODE_COMPONENTS) : undefined),
    [node, createNodeBlock]
  );

  const inline = useMemo(
    () => createNodeBlock(node?.type ? prop(node?.type, NODE_INLINES) : undefined),
    [node, createNodeBlock]
  );

  const lab = useMemo(
    () =>
      node?.type && prop(node.type, LAB_PREVIEW_LAYOUT)
        ? prop(node.type, LAB_PREVIEW_LAYOUT).map((comp, i) => createNodeBlock(comp, i))
        : undefined,
    [node, createNodeBlock]
  );

  return { head, block, inline, lab };
};
