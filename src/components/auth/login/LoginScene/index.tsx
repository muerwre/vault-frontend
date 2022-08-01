import React, { FC, useState } from "react";

import styles from "./styles.module.scss";

interface LoginSceneProps {}

const LoginScene: FC<LoginSceneProps> = () => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={styles.scene}>
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

        <image
          href="/images/clouds.svg"
          width={1920}
          height={1080}
          x={0}
          y={0}
          opacity={loaded ? 1 : 0}
          onLoad={() => setLoaded(true)}
          className={styles.image}
        />
      </svg>
    </div>
  );
};

export { LoginScene };
