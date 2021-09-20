export enum ExperimentalFeatures {
  LiquidFlow = 'liquidFlow',
}

export const experimentalFeatures: Record<ExperimentalFeatures, boolean> = {
  [ExperimentalFeatures.LiquidFlow]: false,
};
