import uuid from 'uuid4';
import { END, eventChannel, EventChannel } from 'redux-saga';
import { VALIDATORS } from '~/utils/validators';
import { IFile, IResultWithStatus } from '~/redux/types';
import { HTTP_RESPONSES } from './api';
import { EMPTY_FILE, FILE_MIMES, UPLOAD_TYPES } from '~/redux/uploads/constants';

export const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];

export function createUploader<T extends {}, R extends {}>(
  callback: (args: any) => any,
  payload: R
): [
  (args: T) => (args: T & { onProgress: (current: number, total: number) => void }) => any,
  EventChannel<any>
] {
  let emit;

  const chan = eventChannel(emitter => {
    emit = emitter;
    return () => null;
  });

  const onProgress = ({ loaded, total }: { loaded: number; total: number }): void => {
    emit(loaded >= total ? END : { ...payload, progress: parseFloat((loaded / total).toFixed(1)) });
  };

  const wrappedCallback = args => callback({ ...args, onProgress });

  return [wrappedCallback, chan];
}

export const uploadGetThumb = async file => {
  if (!file.type || !VALIDATORS.IS_IMAGE_MIME(file.type)) return '';

  return new Promise<string | ArrayBuffer>(resolve => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result || '');
    reader.readAsDataURL(file);
  });
};

export const fakeUploader = ({
  file,
  onProgress,
  mustSucceed,
}: {
  file: { url?: string; error?: string };
  onProgress: (current: number, total: number) => void;
  mustSucceed: boolean;
}): Promise<IResultWithStatus<IFile>> => {
  const { error } = file;

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      onProgress(1, 3);
    }, 1000);

    setTimeout(() => {
      onProgress(2, 3);
    }, 2000);

    setTimeout(() => {
      onProgress(3, 3);
      if (mustSucceed) {
        resolve({ status: HTTP_RESPONSES.CREATED, data: { ...EMPTY_FILE, id: uuid() } });
      } else {
        reject({ response: { statusText: error } });
      }
    }, 3000);
  });
};

export const getFileType = (file: File): keyof typeof UPLOAD_TYPES | undefined =>
  (file.type && Object.keys(FILE_MIMES).find(mime => FILE_MIMES[mime].includes(file.type))) ||
  undefined;
