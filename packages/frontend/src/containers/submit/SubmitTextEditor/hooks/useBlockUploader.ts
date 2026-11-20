import { useCallback, useEffect, useMemo, useRef } from 'react';

import { MAX_BLOCK_FILES } from '@vault/common/constants';
import { toJS } from 'mobx';

import { UploadSubject, UploadTarget, UploadType } from '~/constants/uploads';
import { useUploader } from '~/hooks/data/useUploader';
import { IBlockAudio, IBlockImages } from '~/types';
import { values } from '~/utils/ramda';
import { showToastInfo } from '~/utils/toast';
import { getFileType } from '~/utils/uploader';

import { BlockUpdater } from '../types';

type FileBlock = IBlockImages | IBlockAudio;

/**
 * An uploader of its own for a photo or song block, so the page's upload
 * cards, grids and dropzone work inside it unchanged. It takes only files of
 * the block's type, up to the block's limit and to `left`, what the whole
 * post may still take, and writes what it holds back
 * into the block. Must be read from an observer, which re-renders as uploads
 * land.
 */
export const useBlockUploader = <T extends FileBlock>(
  block: T,
  type: UploadType,
  onChange: BlockUpdater<T>,
  left = Infinity,
  onUploading?: (uploading: boolean) => void,
) => {
  const uploader = useUploader(
    UploadSubject.Editor,
    UploadTarget.Nodes,
    block.files,
  );

  const pendingCount = values(uploader.pending).length;
  const blockRoom = MAX_BLOCK_FILES - uploader.files.length - pendingCount;
  // uploads of other blocks still in flight are not counted; the server
  // cuts whatever ends up past the limit
  const postRoom = left - pendingCount;
  const room = Math.min(blockRoom, postRoom);

  const { uploadFiles: upload } = uploader;

  const uploadFiles = useCallback(
    async (files: File[]) => {
      const fitting = files.filter((file) => getFileType(file) === type);
      const picked = fitting.slice(0, Math.max(room, 0));

      if (picked.length < fitting.length) {
        showToastInfo(
          blockRoom <= postRoom
            ? `В одном блоке не больше ${MAX_BLOCK_FILES} файлов`
            : 'В посте уже максимум таких файлов',
        );
      }

      if (picked.length) {
        await upload(picked);
      }
    },
    [type, room, blockRoom, postRoom, upload],
  );

  const isUploading = pendingCount > 0;

  useEffect(() => {
    onUploading?.(isUploading);
  }, [isUploading, onUploading]);

  // order, membership and song titles are what the block keeps of its files
  const signature = uploader.files
    .map((file) => `${file.id}:${file.metadata?.title ?? ''}`)
    .join('|');

  const latest = useRef({ files: uploader.files, onChange });
  latest.current = { files: uploader.files, onChange };

  const isFirst = useRef(true);

  useEffect(() => {
    // the block already holds what the uploader started with
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    const files = toJS(latest.current.files);
    latest.current.onChange((it) => ({ ...it, files }));
  }, [signature]);

  const context = useMemo(
    () => ({ ...uploader, uploadFiles }),
    [uploader, uploadFiles],
  );

  return { uploader: context, isFull: room <= 0 };
};
