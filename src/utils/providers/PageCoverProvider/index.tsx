import { createContext, FC, useContext, useState, useEffect } from 'react';

import { createPortal } from 'react-dom';

import { imagePresets } from '~/constants/urls';
import { IFile } from '~/types';
import { getURL } from '~/utils/dom';

import styles from './styles.module.scss';

interface CoverContextValue {
  cover: IFile | null;
  setCover: (cover: IFile | null) => void;
}

const CoverContext = createContext<CoverContextValue>({
  cover: null,
  setCover: () => {},
});

const PageCoverProvider: FC = ({ children }) => {
  const [cover, setCover] = useState<IFile | null>(null);

  return (
    <CoverContext.Provider value={{ cover, setCover }}>
      {!!cover &&
        createPortal(
          <div
            className={styles.wrap}
            style={{
              backgroundImage: `url("${getURL(cover, imagePresets.cover)}")`,
            }}
          />,
          document.body,
        )}

      {children}
    </CoverContext.Provider>
  );
};

const usePageCoverContext = () => useContext(CoverContext);

export const usePageCover = (cover?: IFile) => {
  const { setCover } = usePageCoverContext();

  useEffect(() => {
    setCover(cover || null);
    return () => setCover(null);
  }, [setCover, cover]);
};

export { PageCoverProvider, usePageCoverContext };
