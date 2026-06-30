import { UI_STRINGS } from '@/lib/config/ui';

describe('UI_STRINGS', () => {
  it('should have animation class names', () => {
    expect(UI_STRINGS.ANIMATION.WHY_CHOOSE).toBeDefined();
    expect(UI_STRINGS.ANIMATION.WHY_CHOOSE).toHaveLength(4);
  });

  it('should have feature grid animation classes', () => {
    expect(UI_STRINGS.ANIMATION.FEATURE_GRID).toBeDefined();
    expect(UI_STRINGS.ANIMATION.FEATURE_GRID).toHaveLength(3);
  });
});
