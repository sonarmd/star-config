// Smoke test: verify all exports resolve without throwing.
import {describe, it} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {join, dirname} from "node:path";
import {fileURLToPath} from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

describe("@sonarmd/star-config exports", () => {
  it("eslint flat config returns an array", async () => {
    const {default: starConfig} = await import(join(root, "eslint/flat.mjs"));
    const result = starConfig();
    assert.ok(Array.isArray(result), "flat config should return an array");
    assert.ok(result.length > 0, "flat config should not be empty");
  });

  it("eslint flat config accepts options", async () => {
    const {default: starConfig} = await import(join(root, "eslint/flat.mjs"));

    const noTs = starConfig({typescript: false});
    const withReact = starConfig({typescript: true, react: true});

    assert.ok(withReact.length > noTs.length, "react layer should add config objects");
  });

  it("eslint legacy config is a valid object", async () => {
    const {createRequire} = await import("node:module");
    const require = createRequire(import.meta.url);
    const legacy = require(join(root, "eslint/legacy.cjs"));

    assert.equal(typeof legacy, "object");
    assert.ok(legacy.rules, "legacy config should have rules");
    assert.equal(legacy.parser, "@typescript-eslint/parser");
  });

  it("prettier config exports an object", async () => {
    const {createRequire} = await import("node:module");
    const require = createRequire(import.meta.url);
    const prettier = require(join(root, "prettier.config.cjs"));

    assert.equal(typeof prettier, "object");
    assert.equal(prettier.printWidth, 100);
    assert.equal(prettier.singleQuote, true);
    assert.equal(prettier.trailingComma, "es5");
  });

  it("lint-staged config exports an object with glob keys", async () => {
    const {createRequire} = await import("node:module");
    const require = createRequire(import.meta.url);
    const lintStaged = require(join(root, "lint-staged.config.cjs"));

    assert.equal(typeof lintStaged, "object");
    assert.ok(lintStaged["*.{ts,tsx}"], "should have TS glob");
    assert.ok(lintStaged["*.{json,md,yml,yaml}"], "should have non-JS glob");
  });

  it("tsconfig base is valid JSON", () => {
    const raw = readFileSync(join(root, "tsconfig/base.json"), "utf8");
    const config = JSON.parse(raw);
    assert.ok(config.compilerOptions, "should have compilerOptions");
    assert.equal(config.compilerOptions.skipLibCheck, true);
  });

  it("tsconfig presets extend base", () => {
    for (const preset of ["react-app", "node-api", "library"]) {
      const raw = readFileSync(join(root, `tsconfig/${preset}.json`), "utf8");
      const config = JSON.parse(raw);
      assert.ok(config.extends, `${preset} should extend base`);
      assert.ok(config.extends.includes("base"), `${preset} should extend base.json`);
    }
  });

  it("library tsconfig enables strict mode", () => {
    const raw = readFileSync(join(root, "tsconfig/library.json"), "utf8");
    const config = JSON.parse(raw);
    assert.equal(config.compilerOptions.strict, true);
    assert.equal(config.compilerOptions.declaration, true);
  });
});
