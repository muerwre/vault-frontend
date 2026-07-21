import { createContext, ReactNode, useContext, useState } from 'react';

const Context = createContext({
  url: '',
  setUrl: (val: string) => {},
});

/** Provides context for comment video playing */
export const VideoPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [url, setUrl] = useState('');

  return (
    <Context.Provider value={{ url, setUrl }}>{children}</Context.Provider>
  );
};

export const useVideoPlayer = () => useContext(Context);
