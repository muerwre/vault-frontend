import { VALIDATORS } from "~/utils/validators";
import { FILE_MIMES, UploadType } from "~/constants/uploads";

/** if file is image, returns data-uri of thumbnail */
export const uploadGetThumb = async file => {
  if (!file.type || !VALIDATORS.IS_IMAGE_MIME(file.type)) return '';

  return new Promise<string>(resolve => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result?.toString() || '');
    reader.readAsDataURL(file);
  });
};

/** returns UploadType by file */
export const getFileType = (file: File): UploadType | undefined =>
  ((file.type &&
    Object.keys(FILE_MIMES).find(mime => FILE_MIMES[mime].includes(file.type))) as UploadType) ||
  undefined;

/** getImageFromPaste returns any images from paste event */
export const getImageFromPaste = (event: ClipboardEvent): Promise<File | undefined> => {
  const items = event.clipboardData?.items;

  return new Promise(resolve => {
    for (let index in items) {
      const item = items[index];

      if (item.kind === 'file' && item.type.match(/^image\//)) {
        const blob = item.getAsFile();
        const reader = new FileReader();
        const type = item.type;

        reader.onload = function(e) {
          if (!e.target?.result) {
            return;
          }

          resolve(
            new File([e.target?.result], 'paste.png', {
              type,
              lastModified: new Date().getTime(),
            })
          );
        };

        reader.readAsArrayBuffer(blob);
      }
    }

    // resolve(undefined);
  });
};
