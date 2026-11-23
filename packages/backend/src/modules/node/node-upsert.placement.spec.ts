import { NODE_PLACEMENT } from '@vault/common/constants';

import { resolvePlacement } from './node-upsert.service';

const { FLOW, LAB, PROFILE } = NODE_PLACEMENT;

describe('resolvePlacement', () => {
  it('keeps the current placement when the body says nothing', () => {
    expect(resolvePlacement({}, LAB)).toBe(LAB);
    expect(resolvePlacement(undefined, PROFILE)).toBe(PROFILE);
  });

  it('maps is_promoted to flow or lab', () => {
    expect(resolvePlacement({ is_promoted: true }, LAB)).toBe(FLOW);
    expect(resolvePlacement({ is_promoted: false }, FLOW)).toBe(LAB);
  });

  it('lets is_profile win over is_promoted', () => {
    expect(
      resolvePlacement({ is_profile: true, is_promoted: false }, FLOW),
    ).toBe(PROFILE);
  });

  it('moves a node off the profile to wherever is_promoted says', () => {
    expect(
      resolvePlacement({ is_profile: false, is_promoted: false }, PROFILE),
    ).toBe(LAB);
  });

  it('moves a node off the profile to the flow by default', () => {
    expect(resolvePlacement({ is_profile: false }, PROFILE)).toBe(FLOW);
    expect(resolvePlacement({ is_profile: false }, LAB)).toBe(LAB);
  });
});
