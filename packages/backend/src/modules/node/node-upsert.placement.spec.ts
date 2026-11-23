import { NODE_PLACEMENT } from '@vault/common/constants';

import { resolvePlacement } from './node-upsert.service';

const { FLOW, LAB, PROFILE } = NODE_PLACEMENT;

describe('resolvePlacement', () => {
  it('keeps the current placement when the body says nothing', () => {
    expect(resolvePlacement({}, LAB)).toBe(LAB);
    expect(resolvePlacement(undefined, PROFILE)).toBe(PROFILE);
  });

  it('takes a placement as is', () => {
    expect(resolvePlacement({ is_promoted: PROFILE }, FLOW)).toBe(PROFILE);
    expect(resolvePlacement({ is_promoted: LAB }, PROFILE)).toBe(LAB);
    expect(resolvePlacement({ is_promoted: FLOW }, LAB)).toBe(FLOW);
  });

  it('maps the booleans older clients send to flow or lab', () => {
    expect(resolvePlacement({ is_promoted: true }, PROFILE)).toBe(FLOW);
    expect(resolvePlacement({ is_promoted: false }, FLOW)).toBe(LAB);
  });

  it('ignores an unknown placement', () => {
    expect(
      resolvePlacement({ is_promoted: 7 as unknown as typeof FLOW }, LAB),
    ).toBe(LAB);
  });
});
