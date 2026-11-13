export enum ExperimentalFeatures {
  LiquidFlow = 'liquidFlow',
}

export const experimentalFeatures: Record<ExperimentalFeatures, boolean> = {
  [ExperimentalFeatures.LiquidFlow]: false,
};

/** Product features that can be switched off without removing their code. */
export const features = {
  /**
   * The notifications tab in the user sidebar and the unread dot on the user
   * button. While off, settings are never fetched, so the header falls back to
   * its per-section update dots.
   */
  notifications: false,
} as const;
