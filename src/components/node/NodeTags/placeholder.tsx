import React, { FC, memo } from "react";
import { Tags } from "../Tags";
import { ITag } from "~/redux/types";

interface IProps {
  is_editable?: boolean;
  tags: ITag[];
  onChange?: (tags: string[]) => void;
}

const NodeTagsPlaceholder: FC<IProps> = memo(
  ({ is_editable, tags, onChange }) => (
    <Tags tags={tags} is_editable={is_editable} onTagsChange={onChange} />
  )
);

export { NodeTagsPlaceholder };
