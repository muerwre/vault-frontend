import { FC, useMemo } from 'react';

import classNames from 'classnames';
import { transparentize } from 'color2k';
import { isAfter, parseISO } from 'date-fns';

import { NODE_TYPES } from '~/constants/node';
import { imagePresets } from '~/constants/urls';
import { useColorGradientFromString } from '~/hooks/color/useColorGradientFromString';
import { useNodeImages } from '~/hooks/node/useNodeImages';
import { INode } from '~/types';
import { getPhotoBackdrop } from '~/utils/color';
import { getURL } from '~/utils/dom';

import { LabBottomPanel } from './components/LabBottomPanel';
import { useLabNodeBlocks } from './hooks/useLabNodeBlocks';
import styles from './styles.module.scss';

/** Post types whose card has their first photo behind it. */
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

  // A text or song post with a photo has it behind the whole card, its
  // content on a tinted backdrop over it, as a flow cell has its text.
  const images = useNodeImages(node);
  const cover = COVERED_TYPES.includes(node.type ?? '') ? images[0] : undefined;

  // Over a bright photo the text turns dark, and the greys (date, counters,
  // icons) follow it as a lighter shade of that colour.
  const backdrop = useMemo(() => {
    const colors = getPhotoBackdrop(
      node.flow?.dominant_color || cover?.metadata?.dominant_color,
    );

    return colors.color
      ? { ...colors, '--lab_muted': transparentize(colors.color, 0.35) }
      : colors;
  }, [node.flow?.dominant_color, cover]);

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
