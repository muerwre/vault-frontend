import React, {
  createContext,
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { IFile, IFileWithUUID } from '~/redux/types';
import { UPLOAD_SUBJECTS, UPLOAD_TARGETS } from '~/redux/uploads/constants';
import { getFileType } from '~/utils/uploader';
import uuid from 'uuid4';
import { useDispatch } from 'react-redux';
import { uploadUploadFiles } from '~/redux/uploads/actions';
import { useShallowSelect } from '~/hooks/data/useShallowSelect';
import { selectUploads } from '~/redux/uploads/selectors';
import { path } from 'ramda';
import { IUploadStatus } from '~/redux/uploads/reducer';

export const useFileUploader = (
  subject: typeof UPLOAD_SUBJECTS[keyof typeof UPLOAD_SUBJECTS],
  target: typeof UPLOAD_TARGETS[keyof typeof UPLOAD_TARGETS],
  initialFiles?: IFile[]
) => {
  const dispatch = useDispatch();
  const { files: uploadedFiles, statuses } = useShallowSelect(selectUploads);

  const [files, setFiles] = useState<IFile[]>(initialFiles || []);
  const [pendingIDs, setPendingIDs] = useState<string[]>([]);

  const uploadFiles = useCallback(
    (files: File[]) => {
      const items: IFileWithUUID[] = files.map(
        (file: File): IFileWithUUID => ({
          file,
          temp_id: uuid(),
          subject,
          target,
          type: getFileType(file),
        })
      );

      const temps = items.filter(el => !!el.temp_id).map(file => file.temp_id!);

      setPendingIDs([...pendingIDs, ...temps]);
      dispatch(uploadUploadFiles(items));
    },
    [pendingIDs, setPendingIDs, dispatch, subject, target]
  );

  useEffect(() => {
    const added = pendingIDs
      .map(temp_uuid => path([temp_uuid, 'uuid'], statuses) as IUploadStatus['uuid'])
      .filter(el => el)
      .map(el => (path([String(el)], uploadedFiles) as IFile) || undefined)
      .filter(el => !!el! && !files.some(file => file && file.id === el.id));

    const newPending = pendingIDs.filter(
      temp_id =>
        statuses[temp_id] &&
        (!statuses[temp_id].uuid || !added.some(file => file.id === statuses[temp_id].uuid))
    );

    if (added.length) {
      setPendingIDs(newPending);
      setFiles([...files, ...added]);
    }
  }, [statuses, files, pendingIDs, setFiles, setPendingIDs, uploadedFiles]);

  const pending = useMemo(() => pendingIDs.map(id => statuses[id]).filter(el => !!el), [
    statuses,
    pendingIDs,
  ]);

  const isLoading = pending.length > 0;

  return { uploadFiles, pending, files, setFiles, isUploading: isLoading };
};

export type FileUploader = ReturnType<typeof useFileUploader>;
const FileUploaderContext = createContext<FileUploader | undefined>(undefined);

export const FileUploaderProvider: FC<{ value: FileUploader; children }> = ({
  value,
  children,
}) => <FileUploaderContext.Provider value={value}>{children}</FileUploaderContext.Provider>;

export const useFileUploaderContext = () => useContext(FileUploaderContext);
