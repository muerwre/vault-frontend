import { IFile } from '~/types';
import { getURL } from '~/utils/dom';

import { imageSrcSets, ImagePreset } from '../constants/urls';

export const getFileSrcSet = (file: IFile) =>
  Object.keys(imageSrcSets)
    .map(
      (preset) =>
        `${getURL(file, preset as ImagePreset)} ${imageSrcSets[preset]}w`,
    )
    .join(', ');
