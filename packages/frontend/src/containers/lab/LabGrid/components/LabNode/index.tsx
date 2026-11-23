import { FC, useMemo } from 'react';

import classNames from 'classnames';
import { isAfter, parseISO } from 'date-fns';

import { NODE_TYPES } from '~/constants/node';
import { imagePresets } from '~/constants/urls';
import { useColorGradientFromString } from '~/hooks/color/useColorGradientFromString';
import { useNodeImages } from '~/hooks/node/useNodeImages';
import { INode } from '~/types';
import { getPhotoShade } from '~/utils/color';
import { getURL } from '~/utils/dom';

import { LabBottomPanel } from './components/LabBottomPanel';
import { useLabNodeBlocks } from './hooks/useLabNodeBlocks';
import styles from './styles.module.scss';

/** Post types whose card has their cover, or else first photo, behind it. */
const COVERED_TYPES: string[] = [NODE_TYPES.TEXT, NODE_TYPES.AUDIO];

interface Props {
  node: INode;
  lastSeen: string | null | undefined;
  isLoading?: boolean;
  commentCount: number;
}

const LabNode: FC<Props> = ({ node, isLoading, lastSeen, commentCount }) => {
  const blocks = useLabNodeBlocks(node, !!isLoading);

  const hasNewComments = useMemo(
    () =>
      !!node.commented_at &&
      !!lastSeen &&
      isAfter(parseISO(node.commented_at), parseISO(lastSeen)),
    [node.commented_at, lastSeen],
  );

  const background = useColorGradientFromString(node.title, 3, 2);

  // A text or song post with a cover or a photo has it behind the whole card,
  // its content on a tinted backdrop over it, as a flow cell has its text.
  const images = useNodeImages(node);
  const cover = COVERED_TYPES.includes(node.type ?? '')
    ? (node.cover ?? images[0])
    : undefined;

  const backdrop = useMemo(
    () =>
      getPhotoShade(
        cover?.metadata?.dominant_color || node.flow?.dominant_color,
      ),
    [node.flow?.dominant_color, cover],
  );

  return (
    <div
      className={classNames(styles.wrap, { [styles.covered]: !!cover })}
      style={
        cover
          ? {
              backgroundImage: `url("${getURL(cover, imagePresets[600])}")`,
            }
          : { background }
      }
    >
      <div className={styles.content} style={cover ? backdrop : undefined}>
        {blocks}

        <LabBottomPanel
          node={node}
          isLoading={isLoading}
          hasNewComments={hasNewComments}
          commentCount={commentCount}
        />
      </div>
    </div>
  );
};

export { LabNode };
