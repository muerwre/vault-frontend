import React, {
  FC,
  memo,
  MouseEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import styles from "./styles.module.scss";

interface LoginSceneProps {}

interface Layer {
  src: string;
  velocity: number;
  width: number;
  height: number;
}

const layers: Layer[] = [
  {
    src: "/images/clouds__bg.svg",
    velocity: -0.3,
    width: 3840,
    height: 1080,
  },
  {
    src: "/images/clouds__cube.svg",
    velocity: -0.1,
    width: 3840,
    height: 1080,
  },
  {
    src: "/images/clouds__cloud.svg",
    velocity: 0.2,
    width: 3840,
    height: 1080,
  },
  {
    src: "/images/clouds__dudes.svg",
    velocity: 0.5,
    width: 3840,
    height: 1080,
  },
  {
    src: "/images/clouds__trash.svg",
    velocity: 0.8,
    width: 3840,
    height: 1080,
  },
];

const LoginScene: FC<LoginSceneProps> = memo(() => {
  const ref = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  const onMouseMove = useCallback(
    (event: MouseEvent): any => {
      if (!ref.current) {
        return;
      }

      const { x, width } = ref.current.getBoundingClientRect();
      const middle = (width - x) / 2;
      const shift = event.pageX / middle / 2 - 0.5;

      layers.map((it, index) => {
        document.getElementById(
          `LoginScene__${index}`,
        )?.style.transform = `translate(${shift * it.velocity * 200}px, 0)`;
      });
    },
    [ref],
  );

  useEffect(() => {
    document.addEventListener("mousemove", onMouseMove);
    return () => document.removeEventListener("mousemove", onMouseMove);
  }, []);

  return (
    <div className={styles.scene} ref={ref}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="fallbackGradient" x1={0} x2={0} y1={1} y2={0}>
            <stop style={{ stopColor: "#ffccaa", stopOpacity: 1 }} offset="0" />
            <stop
              style={{ stopColor: "#fff6d5", stopOpacity: 1 }}
              offset="0.34655526"
            />
            <stop
              style={{ stopColor: "#afc6e9", stopOpacity: 1 }}
              offset="0.765342"
            />
            <stop style={{ stopColor: "#879fde", stopOpacity: 1 }} offset="1" />
          </linearGradient>
        </defs>

        <rect
          width={1920}
          height={1080}
          x={0}
          y={0}
          fill="url(#fallbackGradient)"
        />

        {layers.map((it, index) => (
          <image
            id={`LoginScene__${index}`}
            key={it.src}
            href={it.src}
            width={it.width}
            height={it.height}
            x={1920 / 2 - it.width / 2}
            y={0}
            opacity={loaded ? 1 : 0}
            onLoad={() => setLoaded(true)}
            className={styles.image}
          />
        ))}
      </svg>
    </div>
  );
});

export { LoginScene };
