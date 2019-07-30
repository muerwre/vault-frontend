import React, { FC } from 'react';
import * as styles from './styles.scss';

interface IProps {
  size?: number;
}

export const LoaderCircle: FC<IProps> = ({ size = 24 }) => (
  <div className={styles.wrap}>
    <svg width={size} height={size} viewBox="0 0 24 24">
      <g strokeWidth={0.5}>
        {
          [...new Array(8)].map((el, i) => (
            <path
              d="M11,2 L11,6 C11,6.55228475 11.4477153,7 12,7 C12.5522847,7 13,6.55228475 13,6 L13,2 C13,1.44771525 12.5522847,1 12,1 C11.4477153,1 11,1.44771525 11,2 Z"
              opacity={0.125 * (8 - i)}
              transform={`rotate(${Math.floor(45 * i)} 12 12)`}
              // style={{
              //   animationDelay: `${-100 * (8 - i)}ms`,
              // }}
              key={i}
            />
          ))
        }
      </g>
    </svg>
  </div>
);

/*
 <div className={styles.wrap}>
 <svg className={styles.icon} width={size} height={size}>
 <path d={describeArc(size / 2, size / 2, size / 2, 0, 90)} />
 <path d={describeArc(size / 2, size / 2, size / 2, 180, 270)} />
 </svg>
 </div>
 */
