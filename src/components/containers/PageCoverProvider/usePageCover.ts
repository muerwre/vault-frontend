import { useEffect } from 'react';

import { usePageCoverContext } from '~/components/containers/PageCoverProvider/index';
import { IFile } from '~/types';

export const usePageCover = (cover?: IFile) => {
  const { setCover } = usePageCoverContext();

  useEffect(() => {
    setCover(cover || null);
    return () => setCover(null);
  }, [setCover, cover]);
};
