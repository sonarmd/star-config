// @sonarmd/star-config — Jest/Vitest coverage threshold preset
//
// Usage in a jest.config.cjs:
//
//   const coverage = require('@sonarmd/star-config/quality/coverage');
//   module.exports = {
//     ...coverage,
//     // your own jest config
//   };
//
// For vitest, adapt — vitest uses `test.coverage.thresholds` shape:
//
//   import coverage from '@sonarmd/star-config/quality/coverage';
//   export default { test: { coverage: { thresholds: coverage.coverageThreshold.global, reporter: coverage.coverageReporters } } };
//
// Thresholds are the SOC2-aligned minimum. Repos with higher coverage
// should set their own stricter values — this is a floor, not a target.

module.exports = {
  collectCoverage: true,
  coverageReporters: ['text-summary', 'lcov', 'json-summary', 'html'],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/\\.next/',
    '/coverage/',
    '/__tests__/',
    '/__mocks__/',
    '/test/',
    '/tests/',
    '\\.test\\.[jt]sx?$',
    '\\.spec\\.[jt]sx?$',
    '\\.d\\.ts$',
  ],
};
