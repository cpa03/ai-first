import {
  isInputElement,
  PLATFORM,
  __resetPlatformCacheForTesting,
} from '@/lib/dom-utils';

describe('DOM Utilities Performance and Correctness', () => {
  let originalNavigator: typeof navigator | undefined;

  beforeAll(() => {
    originalNavigator = global.navigator;
  });

  afterAll(() => {
    if (originalNavigator) {
      Object.defineProperty(global, 'navigator', {
        value: originalNavigator,
        configurable: true,
      });
    }
  });

  describe('isInputElement', () => {
    it('correctly identifies standard input tags', () => {
      const inputs = ['INPUT', 'TEXTAREA', 'SELECT'];
      for (const tag of inputs) {
        const dummyElement = { tagName: tag } as unknown as HTMLElement;
        expect(isInputElement(dummyElement)).toBe(true);
      }
    });

    it('correctly rejects non-input elements', () => {
      const nonInputs = ['DIV', 'SPAN', 'BUTTON', 'A'];
      for (const tag of nonInputs) {
        const dummyElement = { tagName: tag } as unknown as HTMLElement;
        expect(isInputElement(dummyElement)).toBe(false);
      }
    });

    it('benchmarks isInputElement performance', () => {
      const testElements = [
        { tagName: 'INPUT' } as unknown as HTMLElement,
        { tagName: 'TEXTAREA' } as unknown as HTMLElement,
        { tagName: 'SELECT' } as unknown as HTMLElement,
        { tagName: 'DIV' } as unknown as HTMLElement,
        { tagName: 'SPAN' } as unknown as HTMLElement,
      ];

      const ITERATIONS = 10000;
      const start = performance.now();
      for (let i = 0; i < ITERATIONS; i++) {
        for (const el of testElements) {
          isInputElement(el);
        }
      }
      const duration = performance.now() - start;
      console.log(
        `[Benchmark] isInputElement for ${ITERATIONS * testElements.length} elements: ${duration.toFixed(2)}ms`
      );
      expect(duration).toBeLessThan(100); // Should run extremely fast
    });
  });

  describe('PLATFORM getters caching', () => {
    beforeEach(() => {
      __resetPlatformCacheForTesting();
      // Clear cache state if possible (by altering navigator property)
      // Since dom-utils caches on module-level, we define a custom navigator
      Object.defineProperty(global, 'navigator', {
        value: {
          platform: 'MacIntel',
          userAgent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        writable: true,
        configurable: true,
      });
    });

    afterEach(() => {
      __resetPlatformCacheForTesting();
    });

    it('resolves correct platform evaluation based on navigator properties', () => {
      expect(PLATFORM.isMac()).toBe(true);
      expect(PLATFORM.isWindows()).toBe(false);
      expect(PLATFORM.isSafari()).toBe(false); // Since UA has "chrome", isSafari should be false
    });

    it('resolves correct Safari evaluation when UA lacks Chrome', () => {
      __resetPlatformCacheForTesting();
      Object.defineProperty(global, 'navigator', {
        value: {
          platform: 'MacIntel',
          userAgent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15',
        },
        writable: true,
        configurable: true,
      });
      expect(PLATFORM.isSafari()).toBe(true);
    });

    it('benchmarks PLATFORM getters with cached evaluation under pressure', () => {
      const ITERATIONS = 50000;
      const start = performance.now();
      for (let i = 0; i < ITERATIONS; i++) {
        PLATFORM.isMac();
        PLATFORM.isIOS();
        PLATFORM.isWindows();
        PLATFORM.isLinux();
        PLATFORM.isEdge();
        PLATFORM.isFirefox();
        PLATFORM.isSafari();
      }
      const duration = performance.now() - start;
      console.log(
        `[Benchmark] PLATFORM property evaluations (${ITERATIONS * 7} checks): ${duration.toFixed(2)}ms`
      );
      expect(duration).toBeLessThan(150); // Should be almost instant due to caching
    });
  });
});
