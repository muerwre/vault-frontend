import { useEffect } from 'react';
import { IFile } from '~/redux/types';
import { usePageCoverContext } from '~/components/containers/PageCoverProvider/index';

export const usePageCover = (cover?: IFile) => {
  const { setCover } = usePageCoverContext();

  useEffect(() => {
    setCover(cover || null);
    return () => setCover(null);
  }, [setCover, cover]);
};
