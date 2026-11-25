import { createElement, FC, ReactNode, useCallback, useMemo } from 'react';

import { INode } from '~/types';
import { isNil, prop } from '~/utils/ramda';

import { LAB_PREVIEW_LAYOUT, LabBlockProps } from '../constants';

// useNodeBlocks returns head, block and inline blocks of node
export const useLabNodeBlocks = (
  node: INode,
  isLoading: boolean,
  titleIcon?: ReactNode,
) => {
  const createBlock = useCallback(
    (block?: FC<LabBlockProps>, key = 0) =>
      !isNil(block) &&
      createElement(block, {
        node,
        isLoading,
        titleIcon,
        key: `${node.id}-${key}`,
      }),
    [node, isLoading, titleIcon],
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
