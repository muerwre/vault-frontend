import { createContext, FC, useContext, useState, useEffect } from 'react';

import classNames from 'classnames';
import { createPortal } from 'react-dom';

import { imagePresets } from '~/constants/urls';
import { IFile } from '~/types';
import { getURL } from '~/utils/dom';

import styles from './styles.module.scss';

interface CoverContextValue {
  cover: IFile | null;
  setCover: (cover: IFile | null) => void;
  setKeepOnMobile: (keep: boolean) => void;
}

const CoverContext = createContext<CoverContextValue>({
  cover: null,
  setCover: () => {},
  setKeepOnMobile: () => {},
});

const PageCoverProvider: FC = ({ children }) => {
  const [cover, setCover] = useState<IFile | null>(null);
  const [keepOnMobile, setKeepOnMobile] = useState(false);

  return (
    <CoverContext.Provider value={{ cover, setCover, setKeepOnMobile }}>
      {!!cover &&
        createPortal(
          <div
            className={classNames(styles.wrap, {
              [styles.keep_on_mobile]: keepOnMobile,
            })}
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

/**
 * Shows `cover` behind the page while the caller is mounted. Small screens
 * leave it out, unless `keepOnMobile` asks for it, as a page made of little
 * more than its cover does.
 */
export const usePageCover = (
  cover?: IFile,
  { keepOnMobile = false }: { keepOnMobile?: boolean } = {},
) => {
  const { setCover, setKeepOnMobile } = usePageCoverContext();

  useEffect(() => {
    setCover(cover || null);
    return () => setCover(null);
  }, [setCover, cover]);

  useEffect(() => {
    setKeepOnMobile(keepOnMobile);
    return () => setKeepOnMobile(false);
  }, [setKeepOnMobile, keepOnMobile]);
};

export { PageCoverProvider, usePageCoverContext };
