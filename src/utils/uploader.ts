import { eventChannel, END } from 'redux-saga';
import { VALIDATORS } from '~/utils/validators';

export const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];

export function createUploader<T extends {}, R extends {}>
  (callback: (args: any) => any, payload: R):
  [(args: T) => (args: T & { onProgress: (current: number, total: number) => void }) => any, EventChannel<any>] {
  let emit;

  const chan = eventChannel(emitter => {
    emit = emitter;
    return () => null;
  });

  const onProgress = (current: number, total: number): void => {
    emit(current >= total ? END : { ...payload, progress: parseFloat((current / total).toFixed(1)) });
  };

  const wrappedCallback = args => callback({ ...args, onProgress });

  return [wrappedCallback, chan];
}

export const uploadGetThumb = async file => {
  if (!file.type || !VALIDATORS.IS_IMAGE_MIME(file.type)) return '';

  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result || '');
    reader.readAsDataURL(file);
  });
};
