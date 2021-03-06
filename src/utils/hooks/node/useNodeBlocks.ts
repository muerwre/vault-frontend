import { INode } from '~/redux/types';
import { createElement, FC, useCallback, useMemo } from 'react';
import { isNil, prop } from 'ramda';
import {
  INodeComponentProps,
  NODE_COMPONENTS,
  NODE_HEADS,
  NODE_INLINES,
} from '~/redux/node/constants';

// useNodeBlocks returns head, block and inline blocks of node
export const useNodeBlocks = (node: INode, isLoading: boolean) => {
  const createNodeBlock = useCallback(
    (block?: FC<INodeComponentProps>) =>
      !isNil(block) &&
      createElement(block, {
        node,
        isLoading,
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

  return { head, block, inline };
};
