import { VFC } from 'react';

interface MainPreloaderProps {}

const MainPreloader: VFC<MainPreloaderProps> = () => (
  <div id="main_loader">
    <div id="preload_shade">
      <span></span>
      <span></span>
      <span></span>
    </div>

    <div>СМИРЕННО</div>
    <div>ОЖИДАЙТЕ</div>
  </div>
);

export { MainPreloader };
