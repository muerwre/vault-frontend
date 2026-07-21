import { FC } from 'react';

import Image from 'next/future/image';

import { Placeholder } from '~/components/placeholders/Placeholder';
import { NodeComponentProps } from '~/constants/node';
import { imagePresets } from '~/constants/urls';
import { useGotoNode } from '~/hooks/node/useGotoNode';
import { useNodeImages } from '~/hooks/node/useNodeImages';
import { normalizeBrightColor } from '~/utils/color';
import { getURL } from '~/utils/dom';

import styles from './styles.module.scss';

interface Props extends NodeComponentProps {}

const LabImage: FC<Props> = ({ node, isLoading }) => {
  const images = useNodeImages(node);
  const onClick = useGotoNode(node.id);

  if (!images?.length) {
    return null;
  }

  const file = images[0];

  return (
    <Placeholder active={isLoading} width="100%" height={400}>
      <div className={styles.wrapper}>
        <Image
          src={getURL(file, imagePresets[600])}
          width={file.metadata?.width}
          height={file.metadata?.height}
          onClick={onClick}
          alt=""
          className={styles.image}
          color={normalizeBrightColor(file?.metadata?.dominant_color)}
        />
      </div>
    </Placeholder>
  );
};

export { LabImage };
