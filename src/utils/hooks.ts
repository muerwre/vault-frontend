import { useCallback, useEffect, useRef, useState } from "react";
export const useCloseOnEscape = (onRequestClose: () => void, ignore_inputs = false) => {
  const onEscape = useCallback(
    event => {
      if (event.key !== "Escape") return;
      if (
        ignore_inputs &&
        (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA")
      )
        return;

      onRequestClose();
    },
    [onRequestClose]
  );

  useEffect(() => {
    window.addEventListener("keyup", onEscape);

    return () => {
      window.removeEventListener("keyup", onEscape);
    };
  }, [onEscape]);
};

export const useDelayedReady = (setReady: (val: boolean) => void, delay: number = 500) => {
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), delay);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);
};
