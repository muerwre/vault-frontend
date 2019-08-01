import React, {FC} from 'react';

const Sprites: FC<{}> = () => (
  <svg width={0} height={0} viewBox="0 0 20 20">
    <g id="cell-single" stroke="none">
      <path d="M0,0 L9,0 L9,9 L0,9 L0,0 Z M1,1 L1,8 L8,8 L8,1 L1,1 Z"></path>
      <path d="M11,0 L20,0 L20,9 L11,9 L11,0 Z M12,1 L12,8 L19,8 L19,1 L12,1 Z"></path>
      <path d="M11,11 L20,11 L20,20 L11,20 L11,11 Z M12,12 L12,19 L19,19 L19,12 L12,12 Z"></path>
      <path d="M0,11 L9,11 L9,20 L0,20 L0,11 Z M1,12 L1,19 L8,19 L8,12 L1,12 Z"></path>      
    </g>

    <g id="cell-double-h" stroke="none">
      <path d="M0,0 L20,0 L20,9 L0,9 L0,0 Z M1,1 L1,8 L19,8 L19,1 L1,1 Z"></path>
      <path d="M11,11 L20,11 L20,20 L11,20 L11,11 Z M12,12 L12,19 L19,19 L19,12 L12,12 Z"></path>
      <path d="M0,11 L9,11 L9,20 L0,20 L0,11 Z M1,12 L1,19 L8,19 L8,12 L1,12 Z"></path>      
    </g>

    <g id="cell-double-v" stroke="none">
      <path d="M0,0 L20,0 L20,9 L0,9 L0,0 Z M1,1 L1,8 L19,8 L19,1 L1,1 Z"></path>
      <path d="M11,11 L20,11 L20,20 L11,20 L11,11 Z M12,12 L12,19 L19,19 L19,12 L12,12 Z"></path>
      <path d="M0,11 L9,11 L9,20 L0,20 L0,11 Z M1,12 L1,19 L8,19 L8,12 L1,12 Z"></path>      
    </g>

    <g id="play">
      <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69L9.54 5.98C8.87 5.55 8 6.03 8 6.82z"/>
    </g>
    
  </svg>
);

export { Sprites };

// <path d="M0 0H8V8H-8V-8Z" fillRule="evenodd" />