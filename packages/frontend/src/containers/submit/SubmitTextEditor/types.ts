import { IBlock } from '~/types';

/** Replaces a block with what the updater makes of its latest state. */
export type BlockUpdater<T extends IBlock = IBlock> = (
  update: (block: T) => T,
) => void;

export interface BlockEditorProps<T extends IBlock = IBlock> {
  block: T;
  onChange: BlockUpdater<T>;
  disabled?: boolean;
  /**
   * For photo and song blocks: how many more files of the block's type the
   * whole post may take, the block's own already counted.
   */
  left?: number;
  /** For photo and song blocks: called as uploads into the block start and end. */
  onUploading?: (uploading: boolean) => void;
}
