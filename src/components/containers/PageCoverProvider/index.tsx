import React, { createContext, FC, useContext, useState } from 'react';
import styles from './styles.module.scss';
import { createPortal } from 'react-dom';
import { getURL } from '~/utils/dom';
import { PRESETS } from '~/constants/urls';
import { IFile } from '~/redux/types';

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
            style={{ backgroundImage: `url("${getURL(cover, PRESETS.cover)}")` }}
          />,
          document.body
        )}

      {children}
    </CoverContext.Provider>
  );
};

const usePageCoverContext = () => useContext(CoverContext);

export { PageCoverProvider, usePageCoverContext };
