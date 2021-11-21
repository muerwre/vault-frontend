import React, { createContext, FC, useCallback, useContext, useEffect, useState } from 'react';

const DragContext = createContext({
  isDragging: false,
  setIsDragging: (val: boolean) => {},
});

export const DragDetectorProvider: FC = ({ children }) => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <DragContext.Provider value={{ isDragging, setIsDragging }}>{children}</DragContext.Provider>
  );
};

export const useDragDetector = () => {
  const { isDragging, setIsDragging } = useContext(DragContext);

  const onStopDragging = useCallback(() => setIsDragging(false), [setIsDragging]);

  useEffect(() => {
    const addClass = () => setIsDragging(true);

    const removeClass = event => {
      // Small hack to ignore intersection with child elements
      if (event.pageX !== 0 && event.pageY !== 0) {
        return;
      }

      setIsDragging(false);
    };

    document.addEventListener('dragenter', addClass);
    document.addEventListener('dragover', addClass);
    document.addEventListener('dragleave', removeClass);
    document.addEventListener('blur', removeClass);
    document.addEventListener('drop', onStopDragging);

    return () => {
      document.removeEventListener('dragenter', addClass);
      document.removeEventListener('dragover', addClass);
      document.removeEventListener('dragleave', removeClass);
      document.removeEventListener('blur', removeClass);
      document.removeEventListener('drop', onStopDragging);
    };
  }, [onStopDragging, setIsDragging]);

  return { isDragging, onStopDragging };
};
