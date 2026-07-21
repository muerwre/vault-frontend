import { IFile } from '~/types';

const imageHeightPadding = 160; // px, as in styles.module.scss calc(100vh - Npx)

/** Calculates image sizes for images with their aspect ration taken in account */
export const getNodeSwiperImageSizes = (
  file: IFile,
  windowWidth: number,
  windowHeight: number,
) => {
  const height = file.metadata?.height;
  const width = file.metadata?.width;

  if (!height || !width) {
    return undefined;
  }

  const maxHeight = Math.min(height, windowHeight - imageHeightPadding);
  const maxWidth = Math.min((maxHeight / height) * width, windowWidth);

  const size = Math.floor(Math.min((maxWidth / windowWidth) * 100, 100));

  return `${size}vw`;
};
