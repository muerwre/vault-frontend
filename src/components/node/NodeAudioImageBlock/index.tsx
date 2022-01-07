import React, { FC } from "react";
import styles from "./styles.module.scss";
import { path } from "ramda";
import { getURL } from "~/utils/dom";
import { PRESETS } from "~/constants/urls";
import { INodeComponentProps } from "~/constants/node";
import { useNodeImages } from "~/hooks/node/useNodeImages";

interface IProps extends INodeComponentProps {}

const NodeAudioImageBlock: FC<IProps> = ({ node }) => {
  const images = useNodeImages(node);

  if (images.length === 0) return null;

  return (
    <div className={styles.wrap}>
      <div
        className={styles.slide}
        style={{ backgroundImage: `url("${getURL(path([0], images), PRESETS.small_hero)}")` }}
      />
    </div>
  );
};

export { NodeAudioImageBlock };
