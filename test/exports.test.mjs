// Smoke test: verify all exports resolve without throwing.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {describe, it} from 'node:test';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Paths and layer names reused across multiple tests
const flatConfigPath = join(root, 'eslint/flat.mjs');
const sonarConfigPath = join(root, 'eslint/sonar.mjs');
const securityConfigPath = join(root, 'eslint/security.mjs');
const iacConfigPath = join(root, 'eslint/iac.mjs');
const detectPath = join(root, 'dist/detect.js');
const cdkNagPath = join(root, 'dist/cdk-nag.js');

const LAYER_SONAR = 'star-config/sonar';
const LAYER_SECURITY = 'star-config/security';
const LAYER_IAC = 'star-config/iac';

describe('@sonarmd/star-config exports', () => {
  it('eslint flat config returns an array', async () => {
    const {default: starConfig} = await import(flatConfigPath);
    const result = starConfig();
    assert.ok(Array.isArray(result), 'flat config should return an array');
    assert.ok(result.length > 0, 'flat config should not be empty');
  });

  it('eslint flat config accepts options', async () => {
    const {default: starConfig} = await import(flatConfigPath);

    const noTs = starConfig({typescript: false});
    const withReact = starConfig({typescript: true, react: true});

    assert.ok(withReact.length > noTs.length, 'react layer should add config objects');
  });

  it('eslint flat config always includes sonar and security layers', async () => {
    const {default: starConfig} = await import(flatConfigPath);
    const result = starConfig({iac: false});

    const names = result.map((c) => c.name).filter(Boolean);
    assert.ok(names.includes(LAYER_SONAR), 'sonar layer must always be present');
    assert.ok(names.includes(LAYER_SECURITY), 'security layer must always be present');
  });

  it('eslint flat config includes IaC layer when iac: true', async () => {
    const {default: starConfig} = await import(flatConfigPath);
    const withIaC = starConfig({iac: true});
    const withoutIaC = starConfig({iac: false});

    const iacNames = withIaC.map((c) => c.name).filter(Boolean);
    const noIaCNames = withoutIaC.map((c) => c.name).filter(Boolean);

    assert.ok(iacNames.includes(LAYER_IAC), 'iac layer should be present when iac: true');
    assert.ok(!noIaCNames.includes(LAYER_IAC), 'iac layer should be absent when iac: false');
  });

  it('eslint legacy config is a valid object', async () => {
    const {createRequire} = await import('node:module');
    const require = createRequire(import.meta.url);
    const legacy = require(join(root, 'eslint/legacy.cjs'));

    assert.equal(typeof legacy, 'object');
    assert.ok(legacy.rules, 'legacy config should have rules');
    assert.equal(legacy.parser, '@typescript-eslint/parser');
  });

  it('eslint sonar config returns array with cognitive-complexity rule', async () => {
    const {default: sonarConfig} = await import(sonarConfigPath);

    assert.ok(Array.isArray(sonarConfig), 'sonar config should be an array');
    assert.ok(sonarConfig.length > 0);
    assert.equal(sonarConfig[0].name, 'star-config/sonar');

    const {rules} = sonarConfig[0];
    assert.ok(rules['sonarjs/cognitive-complexity'], 'should have cognitive-complexity rule');
    assert.ok(rules['sonarjs/no-duplicate-string'], 'should have no-duplicate-string rule');
    assert.ok(rules['sonarjs/no-identical-functions'], 'should have no-identical-functions rule');
  });

  it('eslint security config returns array with security plugin rules', async () => {
    const {default: securityConfig} = await import(securityConfigPath);

    assert.ok(Array.isArray(securityConfig), 'security config should be an array');
    assert.ok(securityConfig.length > 0);
    assert.equal(securityConfig[0].name, 'star-config/security');

    const {rules} = securityConfig[0];
    assert.ok(typeof rules === 'object', 'security config should have rules');
    // detect-object-injection is explicitly disabled (high false-positive rate)
    assert.equal(rules['security/detect-object-injection'], 'off');
  });

  it('eslint iac config returns array with no-restricted-syntax rules', async () => {
    const {default: iacConfig} = await import(iacConfigPath);

    assert.ok(Array.isArray(iacConfig), 'iac config should be an array');
    assert.ok(iacConfig.length > 0);
    assert.equal(iacConfig[0].name, LAYER_IAC);

    const {rules} = iacConfig[0];
    assert.ok(rules['no-restricted-syntax'], 'should have no-restricted-syntax rule');

    const selectors = rules['no-restricted-syntax'].slice(1).map((entry) => entry.selector);
    assert.ok(
      selectors.some((s) => s.includes('arn:aws:')),
      'should ban hardcoded ARNs'
    );
    assert.ok(
      selectors.some((s) => s.includes('DESTROY')),
      'should ban RemovalPolicy.DESTROY'
    );
  });

  it('detectIaCType returns false for star-config root (not an IaC project)', async () => {
    const {detectIaCType} = await import(detectPath);
    const result = detectIaCType(root);

    assert.equal(typeof result, 'object');
    assert.equal(result.isCDK, false, 'star-config is not a CDK project');
    assert.equal(result.isCloudFormation, false);
    assert.equal(result.isAnsible, false);
    assert.equal(result.isTerraform, false);
    assert.equal(result.hasHeavyAWS, false);
  });

  it('applyHIPAAChecks is exported as a function and throws when cdk-nag is missing', async () => {
    const {applyHIPAAChecks} = await import(cdkNagPath);

    assert.equal(typeof applyHIPAAChecks, 'function', 'applyHIPAAChecks should be a function');

    // cdk-nag is not installed in this package — should throw a helpful error
    await assert.rejects(
      () => applyHIPAAChecks({}),
      (err) => {
        assert.ok(err instanceof Error);
        assert.ok(err.message.includes('cdk-nag'), 'error should mention cdk-nag');
        return true;
      }
    );
  });

  it('prettier config exports an object', async () => {
    const {createRequire} = await import('node:module');
    const require = createRequire(import.meta.url);
    const prettier = require(join(root, 'prettier.config.cjs'));

    assert.equal(typeof prettier, 'object');
    assert.equal(prettier.printWidth, 100);
    assert.equal(prettier.singleQuote, true);
    assert.equal(prettier.trailingComma, 'es5');
  });

  it('lint-staged config exports an object with glob keys', async () => {
    const {createRequire} = await import('node:module');
    const require = createRequire(import.meta.url);
    const lintStaged = require(join(root, 'lint-staged.config.cjs'));

    assert.equal(typeof lintStaged, 'object');
    assert.ok(lintStaged['*.{ts,tsx,js,jsx}'], 'should have TS/JS glob');
    assert.ok(lintStaged['*.{json,md,yml,yaml}'], 'should have non-JS glob');
  });

  it('tsconfig base is valid JSON', () => {
    const raw = readFileSync(join(root, 'tsconfig/base.json'), 'utf8');
    const config = JSON.parse(raw);
    assert.ok(config.compilerOptions, 'should have compilerOptions');
    assert.equal(config.compilerOptions.skipLibCheck, true);
  });

  it('tsconfig node version presets target correct ES versions', () => {
    const expected = {node18: 'ES2022', node20: 'ES2023', node22: 'ES2024'};
    for (const [preset, esTarget] of Object.entries(expected)) {
      const raw = readFileSync(join(root, `tsconfig/${preset}.json`), 'utf8');
      const config = JSON.parse(raw);
      assert.ok(config.extends, `${preset} should extend base`);
      assert.equal(
        config.compilerOptions.target,
        esTarget,
        `${preset} target should be ${esTarget}`
      );
      assert.equal(config.compilerOptions.module, 'Node16', `${preset} module should be Node16`);
    }
  });

  it('commitlint config extends conventional', async () => {
    const {createRequire} = await import('node:module');
    const require = createRequire(import.meta.url);
    const config = require(join(root, 'commitlint.config.cjs'));

    assert.equal(typeof config, 'object');
    assert.ok(config.extends, 'should have extends');
    assert.ok(config.extends.includes('@commitlint/config-conventional'));
    assert.ok(config.rules['type-enum'], 'should have type-enum rule');
  });

  it('husky install script exists', () => {
    const raw = readFileSync(join(root, 'husky/install.mjs'), 'utf8');
    assert.ok(raw.includes('lint-staged'), 'should reference lint-staged');
    assert.ok(raw.includes('commitlint'), 'should reference commitlint');
  });

  it('tsconfig presets extend base', () => {
    for (const preset of ['react-app', 'node-api', 'library']) {
      const raw = readFileSync(join(root, `tsconfig/${preset}.json`), 'utf8');
      const config = JSON.parse(raw);
      assert.ok(config.extends, `${preset} should extend base`);
      assert.ok(config.extends.includes('base'), `${preset} should extend base.json`);
    }
  });

  it('library tsconfig enables strict mode', () => {
    const raw = readFileSync(join(root, 'tsconfig/library.json'), 'utf8');
    const config = JSON.parse(raw);
    assert.equal(config.compilerOptions.strict, true);
    assert.equal(config.compilerOptions.declaration, true);
  });
});
