const { LHCI_CONFIG } = require('./scripts/config');

module.exports = {
  ci: {
    collect: {
      url: [LHCI_CONFIG.URL],
      numberOfRuns: LHCI_CONFIG.NUMBER_OF_RUNS,
      settings: {
        chromeFlags: '--no-sandbox --headless',
        preset: 'desktop',
      },
    },
    assert: {
      assertions: {
        'categories:performance': [
          'warn',
          { minScore: LHCI_CONFIG.MIN_SCORES.PERFORMANCE },
        ],
        'categories:accessibility': [
          'error',
          { minScore: LHCI_CONFIG.MIN_SCORES.ACCESSIBILITY },
        ],
        'categories:best-practices': [
          'warn',
          { minScore: LHCI_CONFIG.MIN_SCORES.BEST_PRACTICES },
        ],
        'categories:seo': ['warn', { minScore: LHCI_CONFIG.MIN_SCORES.SEO }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
