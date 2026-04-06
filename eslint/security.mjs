// @sonarmd/star-config — ESLint: Security layer
// Always-on. Enforces security best practices across all SonarMD repos.
// SOC2 and HIPAA compliance requires these rules at minimum.

import security from 'eslint-plugin-security';

/** @type {import("eslint").Linter.Config[]} */
const config = [
  {
    name: 'star-config/security',
    plugins: {security},
    rules: {
      ...security.configs.recommended.rules,

      // High false-positive rate — disabled. The pattern it targets (obj[userInput])
      // is too broad for TypeScript codebases with typed access.
      'security/detect-object-injection': 'off',
    },
  },
];

export default config;
