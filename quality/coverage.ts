// @sonarmd/star-config — Jest/Vitest coverage threshold preset
//
// Usage in jest.config.ts:
//   import coverage from '@sonarmd/star-config/quality/coverage';
//   export default { ...coverage };
//
// For vitest:
//   import coverage from '@sonarmd/star-config/quality/coverage';
//   export default { test: { coverage: { thresholds: coverage.coverageThreshold.global } } };
//
// Thresholds are the SOC2-aligned minimum floor.

export interface CoverageThresholds {
  branches: number;
  functions: number;
  lines: number;
  statements: number;
}

export interface CoverageConfig {
  collectCoverage: boolean;
  coverageReporters: string[];
  coverageDirectory: string;
  coverageThreshold: {global: CoverageThresholds};
  coveragePathIgnorePatterns: string[];
}

const config: CoverageConfig = {
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

export default config;
