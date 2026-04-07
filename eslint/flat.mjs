// @sonarmd/star-config — ESLint flat config entry point
//
// Usage in consumer repos:
//
//   // eslint.config.mjs
//   import starConfig from "@sonarmd/star-config/eslint";
//   export default starConfig({ typescript: true, react: true });
//
// Layers applied unconditionally: javascript, sonar, security.
// Layers applied when detected or opted-in: typescript, react, iac.

import {existsSync, readFileSync} from 'node:fs';
import {join} from 'node:path';

import eslintConfigPrettier from 'eslint-config-prettier';

import iacConfig from './iac.mjs';
import jsConfig from './javascript.mjs';
import reactConfig from './react.mjs';
import securityConfig from './security.mjs';
import sonarConfig from './sonar.mjs';
import tsConfig from './typescript.mjs';

/**
 * Detect whether the project at rootDir uses IaC tooling.
 * Reads package.json and checks for marker files synchronously.
 * Safe to call at ESLint config evaluation time.
 *
 * @param {string} rootDir
 * @returns {boolean}
 */
function isIaCProject(rootDir) {
  if (existsSync(join(rootDir, 'cdk.json'))) return true;
  if (existsSync(join(rootDir, 'template.yaml'))) return true;
  if (existsSync(join(rootDir, 'template.json'))) return true;
  if (existsSync(join(rootDir, 'samconfig.toml'))) return true;

  try {
    const pkg = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
    const deps = [
      ...Object.keys(pkg.dependencies ?? {}),
      ...Object.keys(pkg.devDependencies ?? {}),
    ];
    if (deps.includes('aws-cdk-lib')) return true;
    if (deps.some((d) => d.startsWith('@aws-cdk/'))) return true;
  } catch {
    // package.json missing or unreadable — not IaC
  }

  return false;
}

/**
 * Build the flat ESLint config array for a project.
 *
 * @param {Object} [options]
 * @param {boolean} [options.typescript=true]   Include TypeScript rules.
 * @param {boolean} [options.react=false]       Include React/hooks rules.
 * @param {'auto'|boolean} [options.iac='auto'] Include IaC rules. 'auto' detects from package.json.
 * @param {import("eslint").Linter.Config[]} [options.overrides=[]] Additional config objects.
 * @returns {import("eslint").Linter.Config[]}
 */
export default function starConfig(options = {}) {
  const {typescript = true, react = false, iac = 'auto', overrides = []} = options;

  const includeIaC = iac === 'auto' ? isIaCProject(process.cwd()) : iac === true;

  return [
    // Global ignores — standard patterns no project should lint.
    {
      ignores: [
        'node_modules/',
        'dist/',
        'build/',
        'out/',
        '.next/',
        'coverage/',
        '.claude/',
        'cdk.out/',
        '**/*.min.js',
        '**/*.bundle.js',
      ],
    },
    ...jsConfig,
    ...sonarConfig, // always-on: code quality + complexity
    ...securityConfig, // always-on: security best practices
    ...(typescript ? tsConfig : []),
    ...(react ? reactConfig : []),
    ...(includeIaC ? iacConfig : []),
    // Prettier must be last — disables formatting rules that conflict.
    eslintConfigPrettier,
    ...overrides,
  ];
}
