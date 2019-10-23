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

    <g id="pause">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" strokeWidth="0" />
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

    <g id="star" stroke="none">
      <path fill="none" d="M0 0h24v24H0V0z" />
      <path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z" />
    </g>

    <g id="star_full" stroke="none">
      <path fill="none" d="M0 0h24v24H0V0z" />
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </g>

    <g id="heart" stroke="none">
      <path fill="none" d="M0 0h24v24H0V0z" />
      <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z" />
    </g>

    <g id="heart_full" stroke="none">
      <path fill="none" d="M0 0h24v24H0V0z" />
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </g>

    <g id="edit" stroke="none">
      <path fill="none" d="M0 0h24v24H0V0z" />
      <path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z" />
    </g>

    <g id="waves" stroke="none">
      <path fill="none" d="M0 0h24v24H0V0z" />
      <path d="M17 16.99c-1.35 0-2.2.42-2.95.8-.65.33-1.18.6-2.05.6-.9 0-1.4-.25-2.05-.6-.75-.38-1.57-.8-2.95-.8s-2.2.42-2.95.8c-.65.33-1.17.6-2.05.6v1.95c1.35 0 2.2-.42 2.95-.8.65-.33 1.17-.6 2.05-.6s1.4.25 2.05.6c.75.38 1.57.8 2.95.8s2.2-.42 2.95-.8c.65-.33 1.18-.6 2.05-.6.9 0 1.4.25 2.05.6.75.38 1.58.8 2.95.8v-1.95c-.9 0-1.4-.25-2.05-.6-.75-.38-1.6-.8-2.95-.8zm0-4.45c-1.35 0-2.2.43-2.95.8-.65.32-1.18.6-2.05.6-.9 0-1.4-.25-2.05-.6-.75-.38-1.57-.8-2.95-.8s-2.2.43-2.95.8c-.65.32-1.17.6-2.05.6v1.95c1.35 0 2.2-.43 2.95-.8.65-.35 1.15-.6 2.05-.6s1.4.25 2.05.6c.75.38 1.57.8 2.95.8s2.2-.43 2.95-.8c.65-.35 1.15-.6 2.05-.6s1.4.25 2.05.6c.75.38 1.58.8 2.95.8v-1.95c-.9 0-1.4-.25-2.05-.6-.75-.38-1.6-.8-2.95-.8zm2.95-8.08c-.75-.38-1.58-.8-2.95-.8s-2.2.42-2.95.8c-.65.32-1.18.6-2.05.6-.9 0-1.4-.25-2.05-.6-.75-.37-1.57-.8-2.95-.8s-2.2.42-2.95.8c-.65.33-1.17.6-2.05.6v1.93c1.35 0 2.2-.43 2.95-.8.65-.33 1.17-.6 2.05-.6s1.4.25 2.05.6c.75.38 1.57.8 2.95.8s2.2-.43 2.95-.8c.65-.32 1.18-.6 2.05-.6.9 0 1.4.25 2.05.6.75.38 1.58.8 2.95.8V5.04c-.9 0-1.4-.25-2.05-.58zM17 8.09c-1.35 0-2.2.43-2.95.8-.65.35-1.15.6-2.05.6s-1.4-.25-2.05-.6c-.75-.38-1.57-.8-2.95-.8s-2.2.43-2.95.8c-.65.35-1.15.6-2.05.6v1.95c1.35 0 2.2-.43 2.95-.8.65-.32 1.18-.6 2.05-.6s1.4.25 2.05.6c.75.38 1.57.8 2.95.8s2.2-.43 2.95-.8c.65-.32 1.18-.6 2.05-.6.9 0 1.4.25 2.05.6.75.38 1.58.8 2.95.8V9.49c-.9 0-1.4-.25-2.05-.6-.75-.38-1.6-.8-2.95-.8z" />
    </g>

    <g id="eye" stroke="none">
      <path fill="none" d="M0 0h24v24H0V0z" />
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
    </g>

    <g id="eye-out" stroke="none">
      <path fill="none" d="M0 0h24v24H0V0z" />
      <path d="M12 6.5c3.79 0 7.17 2.13 8.82 5.5-1.65 3.37-5.02 5.5-8.82 5.5S4.83 15.37 3.18 12C4.83 8.63 8.21 6.5 12 6.5m0-2C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5-2.5-1.12-2.5-2.5 1.12-2.5 2.5-2.5m0-2c-2.48 0-4.5 2.02-4.5 4.5s2.02 4.5 4.5 4.5 4.5-2.02 4.5-4.5-2.02-4.5-4.5-4.5z" />
    </g>

    <g id="hourglass" stroke="none">
      <path fill="none" d="M0 0h24v24H0V0z" />
      <path d="M 434.86328 468.69141 A 12 12 0 0 0 426.20117 472.20508 L 434.6875 480.68945 L 443.17188 472.20508 A 12 12 0 0 0 434.86328 468.69141 z M 434.6875 480.68945 L 426.20117 489.17578 A 12 12 0 0 0 434.6875 492.68945 A 12 12 0 0 0 443.17188 489.17578 L 434.6875 480.68945 z " />
    </g>

    <g id="send" stroke="none">
      <path fill="none" d="M0 0h24v24H0V0z" />
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </g>

    <g id="enter" stroke="none">
      <path fill="none" d="M0 0h24v24H0V0z" />
      <path d="M11 9l1.42 1.42L8.83 14H18V4h2v12H8.83l3.59 3.58L11 21l-6-6 6-6z" />
    </g>

    <g id="photo" stroke="none">
      <path fill="none" d="M0 0h24v24H0V0z" />
      <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
    </g>

    <g id="image" stroke="none">
      <path fill="none" d="M0 0h24v24H0V0z" />
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.96-2.36L6.5 17h11l-3.54-4.71z" />
    </g>

    <g id="profile" stroke="none">
      <path fill="none" d="M0 0h24v24H0V0z" />
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </g>

    <g id="text" stroke="none">
      <path fill="none" d="M0 0h24v24H0V0z" />
      <path d="M14 17H4v2h10v-2zm6-8H4v2h16V9zM4 15h16v-2H4v2zM4 5v2h16V5H4z" />
    </g>

    <g id="video" stroke="none">
      <path fill="none" d="M0 0h24v24H0V0z" />
      <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
    </g>

    <g id="audio" stroke="none">
      <path fill="none" d="M0 0h24v24H0V0z" />
      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
    </g>
  </svg>
);

export { Sprites };
