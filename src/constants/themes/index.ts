export enum Theme {
  Default = 'Default',
  Horizon = 'Horizon',
}

interface ThemeColors {
  colors: string[];
  background: string;
  name: string;
}

export const themeColors: Record<Theme, ThemeColors> = {
  [Theme.Default]: {
    name: 'Волт',
    colors: [
      'linear-gradient(170deg, #00ac35 -50%, #007962 150%)',
      'linear-gradient(165deg, #ff7549 -50%, #ff3344 150%)',
      'linear-gradient(170deg, #582cd0, #592071)',
    ],
    background: `url('/images/noise_top.png') 0% 0% #23201f`,
  },
  [Theme.Horizon]: {
    name: 'Веспера',
    colors: [
      'linear-gradient(170deg, #f09483 -150%, #e95678 100%)',
      'linear-gradient(165deg, #fab795 -50%, #fab795 150%)',
      'linear-gradient(170deg, #25b0bc, #7693d6)',
    ],
    background: `url("/images/horizon_bg.svg") 50% 50% / cover rgb(28, 30, 38)`,
  },
};
