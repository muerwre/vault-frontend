import {
  FC,
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

interface Props {
  children: (props: {
    setRef: (ref: HTMLElement | null) => void;
  }) => ReactElement;
}

const getDistance = (event: TouchEvent) => {
  return Math.hypot(
    event.touches[0].pageX - event.touches[1].pageX,
    event.touches[0].pageY - event.touches[1].pageY,
  );
};

interface Start {
  x: number;
  y: number;
  distance: number;
}

const PinchZoom: FC<Props> = ({ children }) => {
  const start = useRef<Start>({ x: 0, y: 0, distance: 0 });
  const [ref, setRef] = useState<HTMLElement | null>(null);
  const imageElementScale = useRef(1);

  const onTouchStart = useCallback((event: TouchEvent) => {
    if (event.touches.length !== 2) {
      return;
    }
    event.preventDefault(); // Prevent page scroll

    // Calculate where the fingers have started on the X and Y axis
    start.current.x = (event.touches[0].pageX + event.touches[1].pageX) / 2;
    start.current.y = (event.touches[0].pageY + event.touches[1].pageY) / 2;
    start.current.distance = getDistance(event);
  }, []);

  const onTouchMove = useCallback(
    (event) => {
      if (event.touches.length !== 2 || !ref) {
        return;
      }
      event.preventDefault(); // Prevent page scroll

      // Safari provides event.scale as two fingers move on the screen
      // For other browsers just calculate the scale manually
      const scale = event.scale ?? getDistance(event) / start.current.distance;
      imageElementScale.current = Math.min(Math.max(1, scale), 4);

      // Calculate how much the fingers have moved on the X and Y axis
      const deltaX =
        ((event.touches[0].pageX + event.touches[1].pageX) / 2 -
          start.current.x) *
        2; // x2 for accelarated movement
      const deltaY =
        ((event.touches[0].pageY + event.touches[1].pageY) / 2 -
          start.current.y) *
        2; // x2 for accelarated movement

      // Transform the image to make it grow and move with fingers
      const transform = `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${imageElementScale})`;
      ref.style.transform = transform;
      ref.style.zIndex = '9999';
    },
    [ref],
  );

  const onTouchEnd = useCallback(
    (event) => {
      if (!ref) {
        return;
      }

      // Reset image to it's original format
      ref.style.transform = '';
      ref.style.zIndex = '';
    },
    [ref],
  );

  useEffect(() => {
    if (!ref) {
      return;
    }

    ref.addEventListener('touchstart', onTouchStart);
    ref.addEventListener('touchmove', onTouchMove);
    ref.addEventListener('touchend', onTouchEnd);

    return () => {
      ref.removeEventListener('touchstart', onTouchStart);
      ref.removeEventListener('touchmove', onTouchMove);
      ref.removeEventListener('touchend', onTouchEnd);
    };
  }, [onTouchEnd, onTouchMove, onTouchStart, ref]);

  return children({ setRef });
};

export { PinchZoom };
