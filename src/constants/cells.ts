// export const BLOCK_TYPES = {
//   IMAGE: 'IMAGE',
//   TEXT: 'TEXT',
//   VIDEO: 'VIDEO',
//   AUDIO: 'AUDIO',
//   COVER: 'COVER',
// };

// export const CELL_TYPES = {
//   IMAGE: 'IMAGE',
//   POST: 'POST',
//   MEDIA: 'MEDIA',
//   DEFAULT: 'DEFAULT',
// };

// export interface IFile {
//   id: number,
//   cell_id: number,
//   type: string,
//   mime: string,
//   name: string,
//   path: string,
//   createdAt: string,
//   updatedAt: string,
//   owner: number,
// }

// export interface IBlock {
//   block_id: number,
// }

// export interface ICell {
//   type: string,
//   tmp_file_id: number,
//   tmp_block_id: number,
//   cell_id: number,
//   locked_blocks: string[],
//   initial_blocks: string[],
//   available_blocks: string[],
//   blocks: IBlock[],
//   is_published: boolean,
//   is_starred: boolean,
// }

// export const DEFAULT_CELL: ICell = {
//   type: CELL_TYPES.DEFAULT,
//   tmp_file_id: 0,
//   tmp_block_id: 0,
//   cell_id: 0,
//   locked_blocks: [],
//   initial_blocks: [],
//   available_blocks: [],
//   blocks: [],
//   is_published: true,
//   is_starred: false,
// };

// export const DEFAULT_BLOCK: IBlock = {
//   block_id: 0,
// };


// export const DEFAULT_FILE: IFile = {
//   id: 0,
//   cell_id: 0,
//   type: '',
//   mime: '',
//   name: '',
//   path: '',
//   createdAt: '',
//   updatedAt: '',
//   owner: 0,
// };

// interface IBlocks { // todo: continue here
//   // [x: string]: IBlockImage | IBlockMedia
// }

// export const BLOCKS: IBlocks = {
//   [BLOCK_TYPES.IMAGE]: {
//     ...DEFAULT_BLOCK,
//     files: [], // todo: files here
//   }
// };

// export const CELLS = {
//   [CELL_TYPES.IMAGE]: {
//     ...DEFAULT_CELL,
//     locked_blocks: [BLOCK_TYPES.IMAGE],
//     available_blocks: [BLOCK_TYPES.IMAGE, BLOCK_TYPES.TEXT],
//   },
// };

