import React, { FC } from 'react';

const Sprites: FC<{}> = () => (
  <svg width={0} height={0} viewBox="0 0 24 24">
    <g id="cell-single" stroke="none" transform="translate(2 2)">
      <path d="M0,0 L9,0 L9,9 L0,9 L0,0 Z" />
      <path d="M11,0 L20,0 L20,9 L11,9 L11,0 Z M12,1 L12,8 L19,8 L19,1 L12,1 Z" />
      <path d="M11,11 L20,11 L20,20 L11,20 L11,11 Z M12,12 L12,19 L19,19 L19,12 L12,12 Z" />
      <path d="M0,11 L9,11 L9,20 L0,20 L0,11 Z M1,12 L1,19 L8,19 L8,12 L1,12 Z" />
    </g>

    <g id="cell-double-h" stroke="none">
      <path d="M0,0 L20,0 L20,9 L0,9 L0,0 Z M1,1 L1,8 L19,8 L19,1 L1,1 Z" />
      <path d="M11,11 L20,11 L20,20 L11,20 L11,11 Z M12,12 L12,19 L19,19 L19,12 L12,12 Z" />
      <path d="M0,11 L9,11 L9,20 L0,20 L0,11 Z M1,12 L1,19 L8,19 L8,12 L1,12 Z" />
    </g>

    <g id="cell-double-v" stroke="none">
      <path d="M0,0 L20,0 L20,9 L0,9 L0,0 Z M1,1 L1,8 L19,8 L19,1 L1,1 Z" />
      <path d="M11,11 L20,11 L20,20 L11,20 L11,11 Z M12,12 L12,19 L19,19 L19,12 L12,12 Z" />
      <path d="M0,11 L9,11 L9,20 L0,20 L0,11 Z M1,12 L1,19 L8,19 L8,12 L1,12 Z" />
    </g>

    <g id="play">
      <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69L9.54 5.98C8.87 5.55 8 6.03 8 6.82z" />
    </g>

    <g id="plus" stroke="none">
      <path fill="none" d="M0 0h24v24H0V0z" />
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </g>

    <g id="close" stroke="none">
      <path fill="none" d="M0 0h24v24H0V0z" />
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
    </g>

    <g id="check" stroke="none">
      <path fill="none" d="M0 0h24v24H0V0z" />
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
    </g>

    <g id="heart" stroke="none">
      <path fill="none" d="M0 0h24v24H0V0z" />
      <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z" />
    </g>
  </svg>
);

export { Sprites };

// <path d="M0 0H8V8H-8V-8Z" fillRule="evenodd" />
